from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.conf import settings

import razorpay

from .models import Reward
from claims.models import Claim
from notifications.services import notify
from .serializers import RewardSummarySerializer, RewardAmountUpdateSerializer


def _razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        return None
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


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
            return Response(
                {"detail": "Only the owner can set the reward amount."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = RewardAmountUpdateSerializer(reward, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(escrow_status='LOCKED')
        return Response(RewardSummarySerializer(reward, context={'request': request}).data)


class RewardLinkView(APIView):
    """GET /reward/<claim_id>/link/ -> UPI deep link for the set amount."""
    permission_classes = [IsAuthenticated]

    def get(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error
        data = RewardSummarySerializer(reward, context={'request': request}).data
        return Response({"upi_link": data['upi_link'], "amount": data['amount']})


def _release_reward(reward, payment_ref=None):
    """Mark a reward released and notify the finder (used by both verify + mock)."""
    reward.escrow_status = 'RELEASED'
    reward.save(update_fields=['escrow_status', 'updated_at'])
    notify(
        reward.claim.finder, 'REWARD_RECEIVED', 'Reward received',
        f'You received a reward of ₹{reward.amount} for returning '
        f'"{reward.claim.match.lost_item.title}".',
        reference_id=reward.claim_id,
    )


class RewardCreateOrderView(APIView):
    """
    POST /reward/<claim_id>/order/  -> Owner creates a Razorpay order for the
    set amount. Returns the order id + public key for the checkout widget.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error
        if request.user != reward.claim.owner:
            return Response({"detail": "Only the owner can pay the reward."}, status=status.HTTP_403_FORBIDDEN)
        if reward.amount is None or reward.amount <= 0:
            return Response({"detail": "Set a reward amount first."}, status=status.HTTP_400_BAD_REQUEST)

        client = _razorpay_client()
        if client is None:
            return Response(
                {"detail": "Razorpay is not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        amount_paise = int(round(float(reward.amount) * 100))
        order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': f'reward_{reward.claim_id}',
            'notes': {'claim_id': str(reward.claim_id)},
        })
        reward.escrow_status = 'LOCKED'
        reward.save(update_fields=['escrow_status', 'updated_at'])
        return Response({
            'order_id': order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'key_id': settings.RAZORPAY_KEY_ID,
        })


class RewardVerifyPaymentView(APIView):
    """
    POST /reward/<claim_id>/verify/  -> verify the Razorpay signature returned by
    the checkout widget, then release the reward to the finder.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, claim_id):
        reward, error = _get_reward_for_participant(claim_id, request.user)
        if error:
            return error

        client = _razorpay_client()
        if client is None:
            return Response({"detail": "Razorpay is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        params = {
            'razorpay_order_id': request.data.get('razorpay_order_id'),
            'razorpay_payment_id': request.data.get('razorpay_payment_id'),
            'razorpay_signature': request.data.get('razorpay_signature'),
        }
        if not all(params.values()):
            return Response({"detail": "Missing payment parameters."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            client.utility.verify_payment_signature(params)
        except razorpay.errors.SignatureVerificationError:
            return Response({"detail": "Payment signature verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        if reward.escrow_status != 'RELEASED':
            _release_reward(reward, payment_ref=params['razorpay_payment_id'])
        return Response({"message": "Payment verified. Reward released.", "escrow_status": "RELEASED"})


class RewardConfirmPaymentView(APIView):
    """
    POST /reward/webhook/confirm/  -> mock payment confirmation (no auth), used
    as a fallback for the demo when Razorpay keys are not configured.
    Body: { "claim_id": <id> }.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        claim_id = request.data.get('claim_id')
        if not claim_id:
            return Response({"detail": "claim_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        reward = get_object_or_404(Reward, claim_id=claim_id)
        if reward.escrow_status == 'RELEASED':
            return Response({"detail": "Reward already released."}, status=status.HTTP_400_BAD_REQUEST)
        _release_reward(reward)
        return Response({
            "message": "Reward released. Case closed.",
            "escrow_status": reward.escrow_status,
        }, status=status.HTTP_200_OK)
