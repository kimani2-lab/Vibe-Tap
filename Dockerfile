# Dockerfile for Tapfolio Django Backend
# Use lightweight Python 3.12 base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install required Linux system dependencies for PostgreSQL and gunicorn
# gcc and libpq-dev are needed to compile psycopg2-binary
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Optimize Docker layer caching:
# Copy requirements.txt first, install deps, then copy app code

# Copy requirements.txt (and docker specific files)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port 8000 (Django default)
EXPOSE 8000

# Entrypoint: run migrations, collect static, then start gunicorn
# Gunicorn binds to 0.0.0.0:8000
ENTRYPOINT ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000"]