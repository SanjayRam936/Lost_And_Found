from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import random

from .models import Claim
from .serializers import (
    ClaimSerializer,
    ChallengeSerializer,
    OTPVerifySerializer,
    HandoverSerializer
)

class ClaimCreateView(generics.CreateAPIView):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    # permission_classes = [IsAuthenticated] # Uncomment when auth is ready

class ClaimDetailView(generics.RetrieveAPIView):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    lookup_field = 'pk'

class ChallengeSubmitView(APIView):
    """ Step 1: Submit challenge answer """
    def post(self, request, pk):
        claim = get_object_or_404(Claim, pk=pk)
        serializer = ChallengeSerializer(claim, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Here you would typically verify if the answer matches the lost item's hidden details.
            # Assuming challenge passed for the flow:
            claim.status = 'CHALLENGE_PASSED'
            
            # Generate and send OTP
            claim.otp = str(random.randint(100000, 999999))
            claim.otp_sent_at = timezone.now()
            claim.save()
            
            # Note: Integrate actual SMS/Email sending logic here
            return Response({"message": "Challenge passed. OTP sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPVerifyView(APIView):
    """ Step 2: Verify the 6-digit OTP """
    def post(self, request, pk):
        claim = get_object_or_404(Claim, pk=pk)
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            if claim.status != 'CHALLENGE_PASSED':
                return Response({"error": "Invalid state for OTP verification."}, status=status.HTTP_400_BAD_REQUEST)
                
            provided_otp = serializer.validated_data['otp']
            if claim.otp == provided_otp:
                # Check expiration (e.g., 10 minutes)
                if claim.otp_sent_at and timezone.now() < claim.otp_sent_at + timedelta(minutes=10):
                    claim.otp_verified = True
                    claim.status = 'OTP_VERIFIED'
                    claim.save()
                    return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)
                return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPResendView(APIView):
    """ Step 2: Resend the OTP after 60 seconds """
    def post(self, request, pk):
        claim = get_object_or_404(Claim, pk=pk)
        if claim.status != 'CHALLENGE_PASSED':
            return Response({"error": "Cannot resend OTP at this stage."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if 60 seconds have passed since last OTP
        if claim.otp_sent_at and timezone.now() < claim.otp_sent_at + timedelta(seconds=60):
            wait_time = int(60 - (timezone.now() - claim.otp_sent_at).total_seconds())
            return Response({"error": f"Please wait {wait_time} seconds before resending OTP."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
        # Generate new OTP
        claim.otp = str(random.randint(100000, 999999))
        claim.otp_sent_at = timezone.now()
        claim.save()
        
        # Note: Integrate actual SMS/Email sending logic here
        return Response({"message": "A new OTP has been sent."}, status=status.HTTP_200_OK)

class HandoverSubmitView(APIView):
    """ Step 3: Select Handover Method """
    def post(self, request, pk):
        claim = get_object_or_404(Claim, pk=pk)
        if claim.status != 'OTP_VERIFIED':
            return Response({"error": "Must verify OTP before handover selection."}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = HandoverSerializer(claim, data=request.data, partial=True)
        if serializer.is_valid():
            # Update status to completed after successful handover selection
            serializer.save(status='COMPLETED')
            return Response({"message": "Handover selection confirmed. Claim is complete."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
