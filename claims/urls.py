from django.urls import path
from .views import (
    ClaimCreateView,
    ClaimDetailView,
    ChallengeSubmitView,
    OTPVerifyView,
    OTPResendView,
    HandoverSubmitView
)

urlpatterns = [
    # Basic CRUD for claims
    path('', ClaimCreateView.as_view(), name='claim-create'),
    path('<int:pk>/', ClaimDetailView.as_view(), name='claim-detail'),
    
    # Step 1: Challenge
    path('<int:pk>/challenge/', ChallengeSubmitView.as_view(), name='claim-challenge'),
    
    # Step 2: OTP
    path('<int:pk>/otp/verify/', OTPVerifyView.as_view(), name='claim-otp-verify'),
    path('<int:pk>/otp/resend/', OTPResendView.as_view(), name='claim-otp-resend'),
    
    # Step 3: Handover
    path('<int:pk>/handover/', HandoverSubmitView.as_view(), name='claim-handover'),
]
