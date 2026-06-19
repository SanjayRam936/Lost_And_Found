from django.urls import path
from .views import NotificationListView, MarkAllReadView, MarkSingleReadView

urlpatterns = [
    # Matches the /notifications schema
    path('', NotificationListView.as_view(), name='notification-list'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('<int:pk>/mark-read/', MarkSingleReadView.as_view(), name='notification-mark-read'),
]
