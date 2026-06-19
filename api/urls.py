from django.urls import path, include
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from user_accounts.views import RegisterView
from .views import AdminItemsView, AdminMatchesView, AdminClaimsView, AdminSeedView


urlpatterns = [
    #Authentication Routes
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #Admin APIs
    path('admin/items/', AdminItemsView.as_view(), name='admin-items'),
    path('admin/matches/', AdminMatchesView.as_view(), name='admin-matches'),
    path('admin/claims/', AdminClaimsView.as_view(), name='admin-claims'),
    path('admin/seed/', AdminSeedView.as_view(), name='admin-seed-create'),
    path('admin/seed/clear/', AdminSeedView.as_view(), name='admin-seed-clear'),

    #Item Routes
    path('lost-items/', include('lost_items.urls')),
    path('found-items/', include('found_items.urls')),

    #Matching Items
    path('matches/', include('matching.urls')),

    #Claims Routes
    path('claims/', include('claims.urls')),

    #Rewards Routes
    path('reward/', include('rewards.urls')),

    #Notifications Routes
    path('notifications/', include('notifications.urls')),

    #Escalations Routes
    path('escalation/', include('escalations.urls')),
]