from django.urls import path
from .views import (
    RewardSummaryView,
    RewardLinkView,
    RewardCreateOrderView,
    RewardVerifyPaymentView,
    RewardConfirmPaymentView,
)

urlpatterns = [
    path('webhook/confirm/', RewardConfirmPaymentView.as_view(), name='reward-webhook-confirm'),
    path('<int:claim_id>/', RewardSummaryView.as_view(), name='reward-summary'),
    path('<int:claim_id>/link/', RewardLinkView.as_view(), name='reward-link'),
    path('<int:claim_id>/order/', RewardCreateOrderView.as_view(), name='reward-order'),
    path('<int:claim_id>/verify/', RewardVerifyPaymentView.as_view(), name='reward-verify'),
]
