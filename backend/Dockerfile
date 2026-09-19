FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY alembic.ini /app/alembic.ini
COPY alembic ./alembic
COPY app ./app
COPY tests ./tests
COPY entrypoint.sh /app/entrypoint.sh

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["sh", "/app/entrypoint.sh"]
