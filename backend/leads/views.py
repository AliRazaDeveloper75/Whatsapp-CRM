import requests
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin

from .models import Chat, Lead, Message, Tag
from .serializers import ChatDetailSerializer, ChatSerializer, LeadSerializer, MessageSerializer, TagSerializer
from .services import send_whatsapp_text


class IsAdminOrOwnChat(permissions.BasePermission):
    """Admin: full access. Agent: only chats assigned to them."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return obj.assigned_user_id == request.user.id


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwnChat]

    def get_queryset(self):
        user = self.request.user
        qs = Chat.objects.select_related("lead", "assigned_user")
        if user.role == "admin":
            return qs
        return qs.filter(assigned_user=user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ChatDetailSerializer
        return ChatSerializer

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsAdmin])
    def assign(self, request, pk=None):
        """Admin-only: assign (or unassign with user_id=null) a chat to an agent."""
        chat = self.get_object()
        user_id = request.data.get("user_id")
        chat.assigned_user_id = user_id
        chat.status = Chat.Status.IN_PROGRESS if user_id else Chat.Status.UNASSIGNED
        chat.save(update_fields=["assigned_user", "status"])
        return Response(ChatSerializer(chat).data)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.select_related("chat")
        if user.role == "admin":
            return qs
        return qs.filter(chat__assigned_user=user)

    def perform_create(self, serializer):
        """Agent/admin reply: save as outbound, then push it to WhatsApp via Meta."""
        message = serializer.save(
            direction=Message.Direction.OUT,
            delivery_status=Message.DeliveryStatus.PENDING,
        )
        try:
            result = send_whatsapp_text(message.chat.lead.phone_number, message.body)
            message.wa_message_id = result.get("messages", [{}])[0].get("id", "")
            message.delivery_status = Message.DeliveryStatus.SENT
        except requests.RequestException:
            message.delivery_status = Message.DeliveryStatus.FAILED
        message.save(update_fields=["wa_message_id", "delivery_status"])
