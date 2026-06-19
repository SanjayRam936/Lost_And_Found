from django.urls import path, include
from user_accounts.views import RegisterView
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    #Authentication Routes
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #Item Routes
    path('lost-items/', include('lost_items.urls')),
    path('found-items/', include('found_items.urls')),

    #Matching Items
    path('matches/', include('matching.urls')),
]