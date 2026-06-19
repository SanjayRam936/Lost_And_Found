from django.urls import path
from .views import RewardSummaryView, RewardConfirmPaymentView

urlpatterns = [
    # Matches the /reward/:claim_id URL schema requested
    path('<int:claim_id>/', RewardSummaryView.as_view(), name='reward-summary'),
    path('<int:claim_id>/confirm_payment/', RewardConfirmPaymentView.as_view(), name='reward-confirm-payment'),
]
