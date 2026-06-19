from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Reward
from claims.models import Claim
from .serializers import RewardSummarySerializer, RewardAmountUpdateSerializer

class RewardSummaryView(APIView):
    """ Fetch the summary of the reward for a claim or create it if not exists """
    def get(self, request, claim_id):
        claim = get_object_or_404(Claim, pk=claim_id)
        reward, created = Reward.objects.get_or_create(claim=claim)
        serializer = RewardSummarySerializer(reward)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, claim_id):
        """ Update the reward amount """
        claim = get_object_or_404(Claim, pk=claim_id)
        reward, created = Reward.objects.get_or_create(claim=claim)
        serializer = RewardAmountUpdateSerializer(reward, data=request.data, partial=True)
        if serializer.is_valid():
            # Update status to LOCKED once the owner sets the amount
            serializer.save(escrow_status='LOCKED') 
            
            # Re-serialize for full summary output
            full_serializer = RewardSummarySerializer(reward)
            return Response(full_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RewardConfirmPaymentView(APIView):
    """ "I've paid" manual confirm button (for demo purposes) """
    def post(self, request, claim_id):
        claim = get_object_or_404(Claim, pk=claim_id)
        reward = get_object_or_404(Reward, claim=claim)
        
        if reward.escrow_status == 'RELEASED':
            return Response({"error": "Payment has already been released."}, status=status.HTTP_400_BAD_REQUEST)
            
        # For the demo, we'll fast-track the status to RELEASED
        # In a real app, it would be 'AWAITING' and require the finder to confirm receipt
        reward.escrow_status = 'RELEASED'
        reward.save()
        
        return Response({
            "message": "Reward sent! Case closed.",
            "escrow_status": reward.escrow_status,
            "trigger_confetti": True
        }, status=status.HTTP_200_OK)
