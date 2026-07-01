from django.urls import path
from .views import ChatThreadView, MyChatThreadsView

urlpatterns = [
    path('threads/', MyChatThreadsView.as_view(), name='chat-threads'),
    path('<int:match_id>/messages/', ChatThreadView.as_view(), name='chat-thread'),
]
