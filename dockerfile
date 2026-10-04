FROM postgres:18-bookworm

# Set default environment variables for database initialization
ENV POSTGRES_DB=hackyeah2026
ENV POSTGRES_USER=hackyeah2026
ENV POSTGRES_PASSWORD=hackyeah2026

# Copy the initialization script so it runs on first startup
COPY ./postgres-init.sql /docker-entrypoint-initdb.d/01-init.sql

# Expose the default PostgreSQL port
EXPOSE 5432
