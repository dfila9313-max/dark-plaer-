.PHONY: dev down test lint migrate api web

dev:            ## Start the whole stack in Docker
	cp -n .env.example .env || true
	docker compose -f infra/docker-compose.yml up --build

down:
	docker compose -f infra/docker-compose.yml down

api:            ## Run the API locally with reload
	cd apps/api && uv run uvicorn app.main:app --reload

web:            ## Run the web app locally
	cd apps/web && pnpm dev

migrate:
	cd apps/api && uv run alembic upgrade head

lint:
	cd apps/api && uv run ruff check . && uv run ruff format --check . && uv run mypy app
	cd apps/web && pnpm lint && pnpm typecheck

test:
	cd apps/api && uv run pytest
