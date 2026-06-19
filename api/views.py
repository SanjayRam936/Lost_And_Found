from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from lost_items.models import LostItems
from lost_items.serialization import LostItemsSerializer
from found_items.models import FoundItems
from found_items.serialization import FoundItemsSerializer
from matching.models import MatchItem
from matching.serializers import MatchItemSerializer
from claims.models import Claim
from claims.serializers import ClaimSerializer

class AdminItemsView(APIView):
    # permission_classes = [IsAdminUser] # Requires admin access
    def get(self, request):
        lost = LostItems.objects.all()
        found = FoundItems.objects.all()
        
        return Response({
            "lost_items": LostItemsSerializer(lost, many=True).data,
            "found_items": FoundItemsSerializer(found, many=True).data
        }, status=status.HTTP_200_OK)

class AdminMatchesView(APIView):
    # permission_classes = [IsAdminUser]
    def get(self, request):
        matches = MatchItem.objects.all()
        return Response(MatchItemSerializer(matches, many=True).data, status=status.HTTP_200_OK)

class AdminClaimsView(APIView):
    # permission_classes = [IsAdminUser]
    def get(self, request):
        claims = Claim.objects.all()
        return Response(ClaimSerializer(claims, many=True).data, status=status.HTTP_200_OK)

class AdminSeedView(APIView):
    # permission_classes = [IsAdminUser]
    def post(self, request):
        # Demo logic to seed data
        return Response({"message": "Demo data successfully seeded for presentation."}, status=status.HTTP_201_CREATED)
        
    def delete(self, request):
        # Demo logic to clear seeded data
        return Response({"message": "All seeded demo data cleared."}, status=status.HTTP_200_OK)
