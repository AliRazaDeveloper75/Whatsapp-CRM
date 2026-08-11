from rest_framework.routers import DefaultRouter

from .views import ChatViewSet, LeadViewSet, MessageViewSet, TagViewSet

router = DefaultRouter()
router.register("tags", TagViewSet, basename="tag")
router.register("leads", LeadViewSet, basename="lead")
router.register("chats", ChatViewSet, basename="chat")
router.register("messages", MessageViewSet, basename="message")

urlpatterns = router.urls
