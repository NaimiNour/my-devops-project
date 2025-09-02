#!/bin/bash
set -e

echo "🔨 Building Docker image..."
docker build -t my-api:latest .

echo "🏷️  Tagging for Docker Hub..."
docker tag my-api:latest $DOCKER_USERNAME/my-api:latest
docker tag my-api:latest $DOCKER_USERNAME/my-api:$(git rev-parse --short HEAD)

echo "📤 Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/my-api:latest
docker push $DOCKER_USERNAME/my-api:$(git rev-parse --short HEAD)

echo "✅ Build and push completed!"
