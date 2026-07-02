from django.urls import path
from .views import ReportLostItemView, MyLostItemsView, LostItemDetailView

urlpatterns = [
    path('mine/', MyLostItemsView.as_view(), name='my-lost-items'),
    path('report/', ReportLostItemView.as_view(), name='report'),
    path('<int:pk>/', LostItemDetailView.as_view(), name='lost_item_detail'),
]
