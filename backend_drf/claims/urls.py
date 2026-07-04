from django.urls import path
from .views import (
    InitiateClaimView,
    VerifyOwnershipView,
    ClaimDetailView,
    VerifyOTPView,
    RegenerateOTPView,
)

urlpatterns = [
    # Feature 2 — ownership verification must pass before the OTP is issued.
    path('verify-ownership/<int:match_id>/', VerifyOwnershipView.as_view(), name='claim-verify-ownership'),
    path('initiate/<int:match_id>/', InitiateClaimView.as_view(), name='claim-initiate'),
    path('<int:claim_id>/', ClaimDetailView.as_view(), name='claim-detail'),
    path('<int:claim_id>/otp/verify/', VerifyOTPView.as_view(), name='claim-otp-verify'),
    path('<int:claim_id>/otp/regenerate/', RegenerateOTPView.as_view(), name='claim-otp-regenerate'),
]
