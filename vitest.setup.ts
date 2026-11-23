// Integration test setup: load .env (PAYLOAD_SECRET etc.).
// dotenv never overrides variables that are already set, so DATABASE_URL from
// vitest.config.mts (test database) wins over the one in .env.
import 'dotenv/config'
