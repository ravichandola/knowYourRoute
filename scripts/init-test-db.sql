-- Creates a test database alongside the main database.
-- Mounted into Postgres via docker-entrypoint-initdb.d.
SELECT 'CREATE DATABASE know_your_route_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'know_your_route_test')\gexec
