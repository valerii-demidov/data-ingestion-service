.PHONY: up build rebuild restart logs clean

# Start services (rebuild if needed)
up:
	docker compose up --build

# Build without starting
build:
	docker compose build

# Force full rebuild without cache
rebuild:
	docker compose build --no-cache app

# Restart services
restart:
	docker compose restart app

# View logs
logs:
	docker compose logs -f app

# Clean up containers and images
clean:
	docker compose down
	docker rmi data-ingestion-service-app 2>/dev/null || true

# Start in background
up-d:
	docker compose up -d --build

