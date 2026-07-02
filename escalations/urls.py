from django.urls import path
from .views import EscalationRunView, EscalationReportListView, EscalationPDFDownloadView

urlpatterns = [
    path('run/', EscalationRunView.as_view(), name='escalation-run'),
    path('reports/', EscalationReportListView.as_view(), name='escalation-reports'),
    path('reports/<int:pk>/pdf/', EscalationPDFDownloadView.as_view(), name='escalation-pdf-download'),
]
