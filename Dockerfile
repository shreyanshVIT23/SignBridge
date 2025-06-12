# Use an official Python runtime as a parent image
FROM python:3.13-alpine

# Install system dependencies for OpenCV, MediaPipe, build tools
RUN apk add --no-cache \
    build-base \
    cmake \
    pkgconfig \
    mesa-gl \
    glib \
    && rm -rf /var/cache/apk/*

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install Rust-based 'uv' pip tool using pip
RUN pip install uv

# Use 'uv' to install Python dependencies
RUN uv install -r requirements.txt

# Expose port 8000
EXPOSE 8000

# Define environment variable
ENV PYTHONUNBUFFERED=1

# Run the application with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]