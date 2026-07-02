from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from .models import EscalationReport
from .serializers import EscalationReportSerializer

class EscalationRunView(APIView):
    """ Manually trigger the escalation job """
    # permission_classes = [IsAdminUser]
    
    def post(self, request):
        # Core PDF Generation Logic would go here
        # Simulating it by creating a record
        report = EscalationReport.objects.create(
            description="Manually triggered escalation report."
        )
        return Response({
            "message": "Escalation job triggered successfully.", 
            "report_id": report.id
        }, status=status.HTTP_200_OK)

class EscalationReportListView(generics.ListAPIView):
    """ List all generated escalation PDF records """
    # permission_classes = [IsAdminUser]
    queryset = EscalationReport.objects.order_by('-generated_at')
    serializer_class = EscalationReportSerializer

class EscalationPDFDownloadView(APIView):
    """ Download the PDF for a specific escalation """
    # permission_classes = [IsAdminUser]
    
    def get(self, request, pk):
        report = get_object_or_404(EscalationReport, pk=pk)
        if report.pdf_file:
            return FileResponse(report.pdf_file.open('rb'), as_attachment=True, filename=f"Escalation_{report.id}.pdf")
        return Response({"error": "PDF file not yet generated or is missing."}, status=status.HTTP_404_NOT_FOUND)
