# GOK Charsznica

Strona Gminnego Ośrodka Kultury w Charsznicy z panelem do edycji treści (Next.js + Payload CMS 3, PostgreSQL).

## Uruchomienie lokalne

Wymagania: Node.js ≥ 22.23.5, pnpm 10 (przez corepack: `corepack enable`), Docker z Compose.

```sh
cp .env.example .env          # uzupełnij PAYLOAD_SECRET i DATABASE_URL
docker compose up -d          # baza PostgreSQL (gok + gok_test)
pnpm install
pnpm dev
```

- Strona: <http://localhost:3000>
- Panel: <http://localhost:3000/admin> (przy pierwszym wejściu zakłada się konto administratora)
