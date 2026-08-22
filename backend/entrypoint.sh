#!/bin/sh
# =============================================================================
# entrypoint.sh — Django container startup script
# Runs inside the Docker container before Gunicorn starts.
# Order: wait for DB → collectstatic → migrate → start Gunicorn
# =============================================================================
set -e

echo "========================================"
echo " WhatsApp CRM — Container Starting"
echo "========================================"

# ---------------------------------------------------------------------------
# 1. Wait for PostgreSQL to be ready
#    Retries every second until the DB accepts connections (max 60 retries).
# ---------------------------------------------------------------------------
echo "[1/4] Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."

MAX_RETRIES=60
RETRIES=0

until python -c "
import psycopg, sys, os
try:
    conn = psycopg.connect(
        host=os.environ['DB_HOST'],
        port=os.environ['DB_PORT'],
        dbname=os.environ['DB_NAME'],
        user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'],
        connect_timeout=3,
    )
    conn.close()
    sys.exit(0)
except Exception as e:
    sys.exit(1)
" 2>/dev/null; do
    RETRIES=$((RETRIES + 1))
    if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: PostgreSQL not ready after $MAX_RETRIES seconds. Exiting."
        exit 1
    fi
    echo "  Waiting... ($RETRIES/$MAX_RETRIES)"
    sleep 1
done

echo "  PostgreSQL is ready!"

# ---------------------------------------------------------------------------
# 2. Collect static files into /app/staticfiles (served by Nginx)
# ---------------------------------------------------------------------------
echo "[2/4] Running collectstatic ..."
python manage.py collectstatic --noinput --clear

# ---------------------------------------------------------------------------
# 3. Run database migrations
# ---------------------------------------------------------------------------
echo "[3/4] Running migrations ..."
python manage.py migrate --noinput

# ---------------------------------------------------------------------------
# 4. Start Gunicorn — WSGI server for Django
#    Workers = (2 * CPU cores) + 1 is the recommended formula.
#    We use 4 workers as a safe default for most VPS sizes.
# ---------------------------------------------------------------------------
echo "[4/4] Starting Gunicorn ..."
echo "========================================"

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-class sync \
    --timeout 120 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
