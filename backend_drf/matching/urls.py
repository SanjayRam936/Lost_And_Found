from django.urls import path
from . import views

urlpatterns = [
    path('run-match/<int:found_id>/', views.RunMatchingView.as_view(), name='run-match'),
    path('results/<int:found_id>/', views.MatchResultsView.as_view(), name='match-results'),
    path('mine/', views.MyMatchesView.as_view(), name='my-matches'),
    path('for-lost/<int:lost_id>/', views.MatchesForLostView.as_view(), name='matches-for-lost'),
    path('dismiss/<int:match_id>/', views.DismissMatchView.as_view(), name='dismiss-match'),
]