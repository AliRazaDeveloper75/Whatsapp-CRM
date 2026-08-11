import requests
from django.conf import settings

GRAPH_API_VERSION = "v20.0"


def send_whatsapp_text(to: str, body: str) -> dict:
    """Send a plain-text WhatsApp message via the Meta Cloud API.

    Raises requests.HTTPError if Meta rejects the request (e.g. bad token,
    recipient outside the 24h session window without a template).
    """
    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": body},
    }
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    response.raise_for_status()
    return response.json()
