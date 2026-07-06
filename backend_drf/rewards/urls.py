from django.urls import path
from .views import (
    RewardSummaryView,
    RewardLinkView,
    RewardInitiateView,
    RewardConfirmView,
)

urlpatterns = [
    path('<int:claim_id>/', RewardSummaryView.as_view(), name='reward-summary'),
    path('<int:claim_id>/link/', RewardLinkView.as_view(), name='reward-link'),
    path('<int:claim_id>/initiate/', RewardInitiateView.as_view(), name='reward-initiate'),
    path('<int:claim_id>/confirm/', RewardConfirmView.as_view(), name='reward-confirm'),
]
