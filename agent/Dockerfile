FROM python:3.12-slim

WORKDIR /app

COPY agent.py . 



RUN useradd --create-home appuser


USER appuser

CMD ["python","agent.py"]










