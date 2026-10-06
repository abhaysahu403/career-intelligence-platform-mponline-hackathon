FROM python:3.11-slim

# System dependencies
# libgl1 + libglib2.0-0 are required at runtime by opencv-python (cv2 import
# fails with "ImportError: libGL.so.1" without them on the slim base image).
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .

# Install CPU-only torch BEFORE the rest of requirements.txt — sentence-transformers
# pulls in torch transitively, and without this it resolves the default CUDA/GPU
# wheel which drags in ~4GB of unused nvidia/triton packages (this container has
# no GPU). Pinning the +cpu build here first satisfies that dependency so pip
# never reaches for the GPU variant.
RUN pip install --no-cache-dir torch==2.14.0+cpu --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
