from django.urls import path
from .views import CheckFieldView

urlpatterns = [
    path('check-field/', CheckFieldView.as_view(), name='validation-check-field'),
]
