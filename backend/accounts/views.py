from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsAdmin
from .serializers import AgentCreateSerializer, CRMTokenObtainPairSerializer, UserCreateSerializer, UserSerializer


class CRMTokenObtainPairView(TokenObtainPairView):
    serializer_class = CRMTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class AgentViewSet(viewsets.ModelViewSet):
    """Admin-only: create and manage agent accounts."""

    queryset = User.objects.filter(role=User.Role.AGENT)
    permission_classes = [IsAdmin]

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
