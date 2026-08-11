from django.conf import settings
from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Lead(models.Model):
    name = models.CharField(max_length=150, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    source = models.CharField(max_length=100, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name="leads")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or self.phone_number


class Chat(models.Model):
    class Status(models.TextChoices):
        UNASSIGNED = "unassigned", "Unassigned"
        IN_PROGRESS = "in_progress", "In progress"
        CLOSED = "closed", "Closed"

    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name="chat")
    assigned_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_chats",
    )
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.UNASSIGNED)
    last_message_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Chat #{self.pk} — {self.lead}"


class Message(models.Model):
    class Direction(models.TextChoices):
        IN = "in", "Inbound"
        OUT = "out", "Outbound"

    class DeliveryStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        DELIVERED = "delivered", "Delivered"
        READ = "read", "Read"
        FAILED = "failed", "Failed"

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    direction = models.CharField(max_length=3, choices=Direction.choices)
    body = models.TextField(blank=True)
    media_url = models.URLField(blank=True)
    wa_message_id = models.CharField(max_length=100, blank=True, db_index=True)
    delivery_status = models.CharField(max_length=12, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sent_at"]

    def __str__(self):
        return f"{self.direction} · {self.body[:30]}"
