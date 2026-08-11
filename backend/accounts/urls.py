from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AgentViewSet, CRMTokenObtainPairView, MeView

router = DefaultRouter()
router.register("agents", AgentViewSet, basename="agent")

urlpatterns = [
    path("auth/login/", CRMTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
] + router.urls
