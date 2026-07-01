import random

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from matching.models import MatchItem
from notifications.services import notify
from .models import Claim
from .serializers import ClaimSerializer, OTPVerifySerializer


def _generate_otp():
    return str(random.randint(100000, 999999))


class InitiateClaimView(APIView):
    """
    POST /claims/initiate/<match_id>/
    The Owner (lost-item user) starts the claim. For a DIRECT handover an OTP is
    generated; for POLICE/INSTITUTION no OTP is created and the claim is marked
    HANDED_OVER (the Owner is told where to collect the item).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(MatchItem, pk=match_id)

        # Only the Owner (who lost the item) may initiate a claim.
        if request.user != match.lost_item.user:
            return Response(
                {"detail": "Only the item owner can initiate this claim."},
                status=status.HTTP_403_FORBIDDEN,
            )

        handover_type = match.found_item.handover_type
        claim, created = Claim.objects.get_or_create(
            match=match,
            defaults={'handover_type': handover_type},
        )

        if created:
            if handover_type == 'DIRECT':
                claim.otp_code = _generate_otp()
                claim.status = 'INITIATED'
                claim.save()
                notify(
                    claim.finder, 'CLAIM_UPDATE', 'Handover started',
                    f'The owner started a handover for "{match.lost_item.title}". '
                    f'Use the chat to arrange a meetup, then enter their OTP to confirm.',
                    reference_id=claim.id,
                )
            else:
                claim.status = 'HANDED_OVER'
                claim.save()

        serializer = ClaimSerializer(claim, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClaimDetailView(APIView):
    """GET /claims/<claim_id>/ — Owner sees the OTP code, Finder sees null."""
    permission_classes = [IsAuthenticated]

    def get(self, request, claim_id):
        claim = get_object_or_404(Claim, pk=claim_id)
        if not claim.is_participant(request.user):
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        return Response(ClaimSerializer(claim, context={'request': request}).data)


class VerifyOTPView(APIView):
    """
    POST /claims/<claim_id>/otp/verify/  — only the Finder submits the OTP.
    On success the claim (and the underlying match/lost item) is resolved.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, claim_id):
        claim = get_object_or_404(Claim, pk=claim_id)

        if request.user != claim.finder:
            return Response(
                {"detail": "Only the finder can confirm the handover OTP."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if claim.handover_type != 'DIRECT':
            return Response(
                {"detail": "This handover does not use an OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if claim.otp_verified:
            return Response({"detail": "Handover already confirmed."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data['otp'] != claim.otp_code:
            return Response({"detail": "Incorrect OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # Success — resolve the claim and the related records.
        claim.otp_verified = True
        claim.otp_verified_at = timezone.now()
        claim.status = 'RESOLVED'
        claim.save()

        match = claim.match
        match.status = 'RESOLVED'
        match.save(update_fields=['status'])
        lost = match.lost_item
        lost.status = 'RESOLVED'
        lost.save(update_fields=['status'])

        for u in (claim.owner, claim.finder):
            notify(
                u, 'CLAIM_UPDATE', 'Handover confirmed',
                f'The handover for "{lost.title}" was confirmed successfully.',
                reference_id=claim.id,
            )

        return Response(
            {
                "detail": "Handover confirmed.",
                "status": claim.status,
                "wants_reward": match.found_item.wants_reward,
            },
            status=status.HTTP_200_OK,
        )


class RegenerateOTPView(APIView):
    """POST /claims/<claim_id>/otp/regenerate/ — Owner can refresh the OTP."""
    permission_classes = [IsAuthenticated]

    def post(self, request, claim_id):
        claim = get_object_or_404(Claim, pk=claim_id)

        if request.user != claim.owner:
            return Response(
                {"detail": "Only the owner can regenerate the OTP."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if claim.handover_type != 'DIRECT' or claim.status != 'INITIATED':
            return Response(
                {"detail": "OTP cannot be regenerated for this claim."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        claim.otp_code = _generate_otp()
        claim.save(update_fields=['otp_code', 'updated_at'])
        return Response(ClaimSerializer(claim, context={'request': request}).data)
