import logging
import secrets

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Reward
from claims.models import Claim
from notifications.services import notify
from .serializers import RewardSummarySerializer, RewardAmountUpdateSerializer

logger = logging.getLogger(__name__)

OTP_MAX_ATTEMPTS = 5


def _get_reward_for_participant(claim_id, user):
    """Return (reward, error_response). Only claim participants may access it."""
    claim = get_object_or_404(Claim, pk=claim_id)
    if not claim.is_participant(user):
        return None, Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
    if not claim.match.found_item.wants_reward:
        return None, Response(
            {"detail": "The finder did not opt in for a reward."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    reward, _ = Reward.objects.get_or_create(claim=claim)
    return reward, None


class RewardSummaryView(APIView):
    """
    GET  /reward/<claim_id>/  -> reward summary (role-aware)
    PUT  /reward/<claim_id>/  -> Owner sets the amount (-> LOCKED)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error
        return Response(RewardSummarySerializer(reward, context={'request': request}).data)

    def put(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error
        if request.user != reward.claim.owner:
            return Response({"detail": "Only the owner can set the reward amount."}, status=status.HTTP_403_FORBIDDEN)
        serializer = RewardAmountUpdateSerializer(reward, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(escrow_status='LOCKED')
        return Response(RewardSummarySerializer(reward, context={'request': request}).data)


class RewardLinkView(APIView):
    """GET /reward/<claim_id>/link/ -> UPI deep link to pay the finder directly."""
    permission_classes = [IsAuthenticated]

    def get(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error
        data = RewardSummarySerializer(reward, context={'request': request}).data
        return Response({"upi_link": data['upi_link'], "amount": data['amount']})


class RewardInitiateView(APIView):
    """
    POST /reward/<claim_id>/initiate/  -> Owner confirms they've sent the UPI
    payment. Generates a 6-digit OTP and delivers it to the finder, who enters it
    only if the money actually arrived.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error
        if request.user != reward.claim.owner:
            return Response({"detail": "Only the owner can send the reward."}, status=status.HTTP_403_FORBIDDEN)
        if reward.amount is None or reward.amount <= 0:
            return Response({"detail": "Set a reward amount first."}, status=status.HTTP_400_BAD_REQUEST)
        if reward.escrow_status == 'RELEASED':
            return Response({"detail": "This reward is already released."}, status=status.HTTP_400_BAD_REQUEST)

        otp = f"{secrets.randbelow(1_000_000):06d}"
        reward.otp = otp
        reward.otp_attempts = 0
        reward.escrow_status = 'AWAITING'
        reward.save(update_fields=['otp', 'otp_attempts', 'escrow_status', 'updated_at'])

        notify(
            reward.claim.finder, 'OTP_SENT', 'Confirm your reward',
            f'The owner sent your ₹{reward.amount} reward for '
            f'"{reward.claim.match.lost_item.title}". If you received the payment, '
            f'enter this code to confirm: {otp}',
            reference_id=reward.claim_id,
        )
        return Response({"message": "Confirmation code sent to the finder.", "escrow_status": "AWAITING"})


class RewardConfirmView(APIView):
    """
    POST /reward/<claim_id>/confirm/  -> Finder enters the OTP to confirm receipt.
    Releases the reward. Body: { "otp": "123456" }.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error
        if request.user != reward.claim.finder:
            return Response({"detail": "Only the finder can confirm receipt."}, status=status.HTTP_403_FORBIDDEN)
        if reward.escrow_status == 'RELEASED':
            return Response({"message": "Already confirmed.", "escrow_status": "RELEASED"})
        if reward.escrow_status != 'AWAITING' or not reward.otp:
            return Response({"detail": "No confirmation is pending yet. Ask the owner to send the reward first."},
                            status=status.HTTP_400_BAD_REQUEST)
        if reward.otp_attempts >= OTP_MAX_ATTEMPTS:
            return Response({"detail": "Too many incorrect attempts. Ask the owner to resend."},
                            status=status.HTTP_429_TOO_MANY_REQUESTS)

        code = (request.data.get('otp') or '').strip()
        if code != reward.otp:
            reward.otp_attempts += 1
            reward.save(update_fields=['otp_attempts'])
            return Response({"detail": "Incorrect code. Please check and try again."},
                            status=status.HTTP_400_BAD_REQUEST)

        reward.escrow_status = 'RELEASED'
        reward.otp = ''
        reward.save(update_fields=['escrow_status', 'otp', 'updated_at'])
        notify(
            reward.claim.owner, 'CLAIM_UPDATE', 'Reward confirmed',
            f'{reward.claim.finder.full_name or "The finder"} confirmed receiving the '
            f'₹{reward.amount} reward. The case is closed.',
            reference_id=reward.claim_id,
        )
        return Response({"message": "Reward confirmed.", "escrow_status": "RELEASED"})
