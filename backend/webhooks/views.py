from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from leads.models import Chat, Lead, Message


class WhatsAppWebhookView(APIView):
    """Meta Cloud API webhook: verification handshake (GET) + inbound events (POST)."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if (
            request.GET.get("hub.mode") == "subscribe"
            and request.GET.get("hub.verify_token") == settings.WHATSAPP_VERIFY_TOKEN
        ):
            return HttpResponse(request.GET.get("hub.challenge", ""), content_type="text/plain")
        return HttpResponse(status=403)

    def post(self, request):
        for entry in request.data.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                self._handle_messages(value)
                self._handle_statuses(value)
        return Response({"status": "ok"})

    def _handle_messages(self, value):
        contacts = {c["wa_id"]: c.get("profile", {}).get("name", "") for c in value.get("contacts", [])}
        for msg in value.get("messages", []):
            wa_id = msg["from"]
            lead, _ = Lead.objects.get_or_create(
                phone_number=wa_id,
                defaults={"name": contacts.get(wa_id, ""), "source": "whatsapp"},
            )
            chat, _ = Chat.objects.get_or_create(lead=lead)
            Message.objects.create(
                chat=chat,
                direction=Message.Direction.IN,
                body=msg.get("text", {}).get("body", ""),
                wa_message_id=msg.get("id", ""),
                delivery_status=Message.DeliveryStatus.DELIVERED,
            )
            chat.last_message_at = timezone.now()
            chat.save(update_fields=["last_message_at"])

    def _handle_statuses(self, value):
        valid_statuses = dict(Message.DeliveryStatus.choices)
        for status in value.get("statuses", []):
            wamid = status.get("id")
            new_status = status.get("status")
            if wamid and new_status in valid_statuses:
                Message.objects.filter(wa_message_id=wamid).update(delivery_status=new_status)
