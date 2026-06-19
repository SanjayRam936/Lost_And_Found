from django.urls import path
from .views import ReportFoundItemView, FoundItemDetailView

urlpatterns = [
    path('report/', ReportFoundItemView.as_view(), name='report'),
    path('<int:pk>/', FoundItemDetailView.as_view(), name='found_item_detail'),
]
