from django.contrib import admin

from .models import Chat, Lead, Message, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["name", "phone_number", "source", "created_at"]
    search_fields = ["name", "phone_number"]


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ["sent_at"]


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ["id", "lead", "assigned_user", "status", "last_message_at"]
    list_filter = ["status"]
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["chat", "direction", "delivery_status", "sent_at"]
    list_filter = ["direction", "delivery_status"]
