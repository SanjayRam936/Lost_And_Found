from django.urls import path
from .views import (
    InitiateClaimView,
    ClaimDetailView,
    VerifyOTPView,
    RegenerateOTPView,
)

urlpatterns = [
    path('initiate/<int:match_id>/', InitiateClaimView.as_view(), name='claim-initiate'),
    path('<int:claim_id>/', ClaimDetailView.as_view(), name='claim-detail'),
    path('<int:claim_id>/otp/verify/', VerifyOTPView.as_view(), name='claim-otp-verify'),
    path('<int:claim_id>/otp/regenerate/', RegenerateOTPView.as_view(), name='claim-otp-regenerate'),
]
