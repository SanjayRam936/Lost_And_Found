from django.urls import path, include
from django.http import JsonResponse
from .views import (
    AdminStatsView, AdminUsersView, AdminItemsView, AdminMatchesView, AdminClaimsView,
)


# Lightweight, auth-free liveness probe. The frontend hits this on startup to
# decide whether the local backend is up (else it falls back to the HF Space).
def health(_request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    #Health check (public) — used by the frontend's local/remote auto-detect
    path('health/', health, name='health'),

    #Authentication Routes (register, login, logout, token refresh, me, change-password)
    path('', include('user_accounts.urls')),

    #Admin APIs (staff only)
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/items/', AdminItemsView.as_view(), name='admin-items'),
    path('admin/matches/', AdminMatchesView.as_view(), name='admin-matches'),
    path('admin/claims/', AdminClaimsView.as_view(), name='admin-claims'),

    #Item Routes
    path('lost-items/', include('lost_items.urls')),
    path('found-items/', include('found_items.urls')),

    #Matching Items
    path('matches/', include('matching.urls')),

    #Claims Routes
    path('claims/', include('claims.urls')),

    #Rewards Routes
    path('reward/', include('rewards.urls')),

    #Chat Routes
    path('chat/', include('chat.urls')),

    #Notifications Routes
    path('notifications/', include('notifications.urls')),

    #Escalations Routes
    path('escalation/', include('escalations.urls')),
]