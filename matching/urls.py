from django.urls import path
from . import views

urlpatterns = [
    path('run-match/<int:found_id>/', views.RunMatchingView.as_view(), name='run-match'),
    path('results/<int:found_id>/', views.MatchResultsView.as_view(), name='match-results'),
    path('dismiss/<int:match_id>/', views.DismissMatchView.as_view(), name='dismiss-match'),
]