from django.urls import path
from .views import ReportLostItemView, LostItemDetailView

urlpatterns = [
    path('report/', ReportLostItemView.as_view(), name='report'),
    path('<int:pk>/', LostItemDetailView.as_view(), name='lost_item_detail'),
]
