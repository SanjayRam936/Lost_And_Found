from django.urls import path
from .views import ReportFoundItemView, MyFoundItemsView, FoundItemDetailView

urlpatterns = [
    path('mine/', MyFoundItemsView.as_view(), name='my-found-items'),
    path('report/', ReportFoundItemView.as_view(), name='report'),
    path('<int:pk>/', FoundItemDetailView.as_view(), name='found_item_detail'),
]
