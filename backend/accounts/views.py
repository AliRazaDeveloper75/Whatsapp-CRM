from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import ActivityViolation, User
from .permissions import IsAdmin, IsTL
from .serializers import (
    ActivityViolationSerializer,
    AgentCreateSerializer,
    CRMTokenObtainPairSerializer,
    UserCreateSerializer,
    UserSerializer,
)


class CRMTokenObtainPairView(TokenObtainPairView):
    serializer_class = CRMTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class AgentViewSet(viewsets.ModelViewSet):
    """Admin: manage any agent. Team Lead: read-only view of their own team's agents."""

    def get_queryset(self):
        qs = User.objects.filter(role=User.Role.AGENT)
        if self.request.user.role == User.Role.TL:
            return qs.filter(team_lead=self.request.user)
        return qs

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated(), (IsAdmin | IsTL)()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == "create":
            return AgentCreateSerializer
        return UserSerializer


class UserListViewSet(viewsets.ModelViewSet):
    """Admin-only: view and create user accounts of any role, including admin."""

    queryset = User.objects.all().order_by("username")
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer


class ActivityViolationViewSet(viewsets.ModelViewSet):
    """Agents/TLs report blocked copy/right-click attempts here; admin reviews them."""

    http_method_names = ["get", "post"]
    queryset = ActivityViolation.objects.select_related("user").all()
    serializer_class = ActivityViolationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
