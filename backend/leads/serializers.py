from rest_framework import serializers

from .models import Chat, Lead, Message, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "chat", "direction", "body", "media_url", "wa_message_id", "delivery_status", "sent_at"]
        read_only_fields = ["id", "direction", "wa_message_id", "sent_at", "delivery_status"]


class LeadSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = ["id", "name", "phone_number", "source", "tags", "created_at"]


class ChatSerializer(serializers.ModelSerializer):
    lead = LeadSerializer(read_only=True)
    lead_id = serializers.PrimaryKeyRelatedField(source="lead", queryset=Lead.objects.all(), write_only=True)
    assigned_user_username = serializers.CharField(source="assigned_user.username", read_only=True, default=None)

    class Meta:
        model = Chat
        fields = [
            "id",
            "lead",
            "lead_id",
            "assigned_user",
            "assigned_user_username",
            "status",
            "last_message_at",
        ]
        read_only_fields = ["id", "assigned_user", "status", "last_message_at"]


class ChatDetailSerializer(ChatSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta(ChatSerializer.Meta):
        fields = ChatSerializer.Meta.fields + ["messages"]
