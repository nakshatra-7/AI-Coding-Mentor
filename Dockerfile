# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY backend ./backend
COPY frontend ./frontend

# Expose the port
EXPOSE 8000

# Start the backend app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
