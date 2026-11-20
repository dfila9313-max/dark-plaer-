# ADMINO

SaaS-платформа для барбершопов и салонов красоты: онлайн-запись, расписание мастеров, клиенты, команда.

## Структура

```
apps/api    FastAPI + SQLAlchemy + Alembic (Python 3.12+)
apps/web    Next.js + React + TypeScript + Tailwind
infra/      docker-compose для локальной разработки
docs/       архитектура, решения (ADR)
```

## Запуск

```bash
make dev        # всё в Docker: web :3000, api :8000, почта :8025, хранилище :9001
make test       # тесты API на реальной PostgreSQL
make lint       # линтеры и проверка типов
```

API-документация в режиме разработки: http://localhost:8000/api/v1/docs

## Процесс

Каждый этап — отдельная ветка `stage-N-…` и pull request. В `main` попадает только то, что прошло CI.
План и архитектура: [docs/architecture.md](docs/architecture.md).
