# Plan 1: Fundament — Implementation Plan

> Kroki oznaczone checkboxami (`- [ ]`); każde zadanie kończy się przeglądem i akceptacją przed kolejnym.

**Goal:** Działająca aplikacja Next.js + Payload z panelem po polsku, edytowalnymi globals „Dane GOK” i „Menu”, dostępnym szkieletem strony (pasek dostępności, nagłówek, menu desktop/mobile, stopka) w kierunku wizualnym v0.1, wdrażana automatycznie na staging pod hasłem.

**Architecture:** Jedno repo, jeden proces: Payload 3 osadzony w Next.js App Router (`src/app/(payload)` = panel, `src/app/(frontend)` = strona). Strona czyta globals przez Payload Local API w Server Components, z cache tagowanym i revalidacją z hooków `afterChange`. Preferencje dostępności w ciasteczku czytanym na serwerze (bez migania). Produkcyjny obraz Docker (`output: 'standalone'`, migracje przez `prodMigrations`), Caddy jako reverse proxy z SSL i Basic Auth na staging.

**Tech Stack:** Next.js (App Router), Payload CMS 3, `@payloadcms/db-postgres`, PostgreSQL 17, TypeScript strict, pnpm, Tailwind CSS v4, `next/font`, `lucide-react`, Vitest, Playwright + `@axe-core/playwright`, Docker Compose, Caddy 2, GitHub Actions, GHCR.

**Spec:** `docs/specs/2026-11-19-gok-strona-design.md` + `docs/design/kierunek-wizualny.md` (v0.1). Mapa planów: `docs/plany/00-mapa-planow.md`.

## Prerequisites (sprawdź przed Task 1; jeśli brak — zatrzymaj się i zapytaj Kamila)

- Node.js LTS (≥ 22) + pnpm 10.x przypięty w `packageManager` (corepack), Docker + Docker Compose lokalnie.
- Przed Task 9: puste repo na GitHubie (nazwa i właściciel od Kamila).
- Przed Task 10: VPS (Ubuntu LTS) z dostępem SSH oraz rekord DNS A dla adresu staging (domena GOK lub tymczasowa subdomena Kamila).

## Global Constraints

- Wersje wszystkich zależności przypięte dokładnie (bez `^`/`~`); najnowsze stabilne w dniu startu.
- UI, etykiety panelu, komunikaty, `aria-label`: polski. Kod, slugi kolekcji/globals, pola, komentarze, commity: angielski.
- URL-e publiczne po polsku bez diakrytyków: `/aktualnosci`, `/wydarzenia`, `/sekcje`, `/galeria`, `/do-pobrania`, `/kontakt`, `/polityka-prywatnosci`, `/deklaracja-dostepnosci`.
- `<html lang="pl">`; wszystkie rozmiary w `rem` (poza liniami 1 px); bazowy tekst 18 px = `1.125rem`.
- Kolory wyłącznie przez tokeny z `kierunek-wizualny.md` §2 (wartości hex 1:1); zero surowych hexów w komponentach.
- Rozmiar tekstu: `html` 100% / 125% / 150% (A / A+ / A++); kontrast: `html[data-contrast="high"]` wg §2 „Tryb kontrastowy”.
- Pola klikalne min. 48 px wysokości (min. 44×44 dla ikon); widoczny focus: 3 px `focus`, offset 2 px.
- Server Components domyślnie; `'use client'` tylko: A11yToolbar, DesktopNav (rozwijanie), MobileMenu.
- Fonty samohostowane (`next/font`); żadnych zasobów zewnętrznych w runtime.
- Animacje ≤ 200 ms, wyłączone przy `prefers-reduced-motion: reduce`.
- Staging: Basic Auth + nagłówek `X-Robots-Tag: noindex, nofollow`.
- Commity w Conventional Commits; autor: Kamil Pigulak. Praca na gałęzi `develop`, scalanie do `main` przez PR.

## Review Focus

- Pozycja menu bez celu (zewnętrzna bez URL, „tylko podmenu” bez dzieci) → pomijana, nigdy pusty/zepsuty link. *(Task 5: `buildNav` tests)*
- Ciasteczko preferencji zmanipulowane lub w starym formacie → wartości domyślne, brak błędu renderu. *(Task 4: `parseA11yPrefs` tests)*
- Świeża instalacja: puste „Dane GOK” (brak telefonu, e-maila, social) → nagłówek i stopka bez pustych linków `tel:`/`mailto:`/ikon. *(Task 5: `buildContactLinks` tests; Task 7: e2e `no empty links`)*
- A++ (150%) na telefonie 390 px z długimi polskimi etykietami menu → brak poziomego przewijania. *(Task 7: e2e `no horizontal scroll at A++`)*
- Link zewnętrzny w menu w nowej karcie → `rel="noopener noreferrer"` i tekst dla czytnika „(otwiera się w nowej karcie)”. *(Task 5 unit + Task 7 e2e)*

---

## File Structure

```
.gitignore  .env.example  package.json  pnpm-lock.yaml  tsconfig.json  next.config.ts
eslint.config.mjs  .prettierrc  vitest.config.mts  playwright.config.ts
docker-compose.yml                      # dev: postgres
src/
  payload.config.ts                     # db, i18n pl, admin meta, globals, prodMigrations
  payload-types.ts                      # generowane (pnpm generate:types)
  migrations/                           # generowane (pnpm payload migrate:create)
  globals/Settings.ts                   # „Dane GOK”
  globals/Navigation.ts                 # „Menu”
  hooks/revalidateGlobal.ts             # afterChange → revalidateTag
  lib/payload.ts                        # getSettings(), getNavigation() (cache + tagi)
  lib/navigation.ts                     # LIST_ROUTES, NavLink, buildNav()
  lib/contact.ts                        # ContactLink, buildContactLinks()
  lib/a11y-prefs.ts                     # A11Y_COOKIE, parse/serialize
  lib/contrast.ts                       # contrastRatio()
  app/(frontend)/layout.tsx             # html/body, fonty, data-* z ciasteczka, shell
  app/(frontend)/page.tsx               # tymczasowa strona główna (h1 + main)
  app/(frontend)/styles.css             # Tailwind v4 + @theme tokeny + tryby
  app/(frontend)/fonts.ts               # next/font
  app/(payload)/...                     # z szablonu Payload (bez zmian)
  components/layout/SkipLink.tsx
  components/layout/A11yToolbar.tsx     # client
  components/layout/Header.tsx
  components/layout/DesktopNav.tsx      # client
  components/layout/MobileMenu.tsx      # client
  components/layout/Footer.tsx
  components/layout/LogoPlaceholder.tsx # do czasu wektora logo
tests/
  unit/*.test.ts
  int/globals.int.test.ts
  e2e/shell.spec.ts   e2e/seed.ts
Dockerfile  .dockerignore
deploy/compose.server.yml  deploy/Caddyfile  deploy/.env.server.example
.github/workflows/ci.yml  .github/workflows/deploy-staging.yml
docs/ops/serwer.md
```

---

### Task 1: Repozytorium i szkielet Next + Payload

**Files:**
- Create: `.gitignore`, `.env.example`, `docker-compose.yml`, cały szkielet z `create-payload-app`
- Modify: `package.json` (przypięte wersje, skrypty), `src/payload.config.ts`

**Interfaces:**
- Produces: skrypty `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm generate:types`, `pnpm payload`; zmienne env `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`.

- [ ] **Step 1:** Repo już istnieje (`origin`, gałęzie `main` i `develop`) — praca na `develop`.
- [ ] **Step 2:** Wygeneruj szablon w katalogu tymczasowym: `pnpm dlx create-payload-app@latest gok -t blank --db postgres --use-pnpm --no-deps`, następnie skopiuj jego zawartość do repo (bez nadpisywania `docs/`).
- [ ] **Step 3:** `pnpm install`, potem w `package.json` zamień wszystkie zakresy na dokładne wersje z `pnpm-lock.yaml` (bez `^`/`~`); dodaj `"packageManager"` i `"engines": { "node": ">=22" }`.
- [ ] **Step 4:** `docker-compose.yml` z usługą `postgres:17-alpine` (port 5432, wolumen, baza `gok`, dodatkowa baza `gok_test` przez skrypt init). `.env.example`: `DATABASE_URI=postgres://gok:gok@localhost:5432/gok`, `PAYLOAD_SECRET=`, `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`. `.gitignore`: `.env`, `media/`, `.next/`, `node_modules/`, `test-results/`, `playwright-report/`.
- [ ] **Step 5:** W `src/payload.config.ts`: `i18n: { supportedLanguages: { pl }, fallbackLanguage: 'pl' }` (import `pl` z `@payloadcms/translations/languages/pl`), `admin.meta.titleSuffix: ' — Panel GOK Charsznica'`; kolekcja `users` z etykietami `Użytkownik` / `Użytkownicy`.
- [ ] **Step 6:** Weryfikacja: `docker compose up -d && pnpm dev`, otwórz `http://localhost:3000/admin` → ekran tworzenia pierwszego użytkownika **po polsku**. Utwórz konto testowe.
- [ ] **Step 7:** Commit: `chore: scaffold Next.js + Payload 3 with Postgres and Polish admin`.

### Task 2: Narzędzia jakości i testów

**Files:**
- Create: `vitest.config.mts`, `playwright.config.ts`, `.prettierrc`, `tests/unit/sanity.test.ts`, `tests/e2e/admin.spec.ts`
- Modify: `package.json`, `eslint.config.mjs`

**Interfaces:**
- Produces: skrypty `pnpm lint`, `pnpm typecheck` (`tsc --noEmit`), `pnpm test:unit` (`vitest run tests/unit`), `pnpm test:int` (`vitest run tests/int`, env `DATABASE_URI` → `gok_test`), `pnpm test:e2e` (`playwright test`), `pnpm test` (unit+int). Playwright: projekty `desktop` (1280×800) i `mobile` (390×844), `webServer: pnpm build && pnpm start`, baseURL `http://localhost:3000`.

- [ ] **Step 1:** Dodaj zależności dev (przypięte): `vitest`, `@playwright/test`, `@axe-core/playwright`, `prettier`; `pnpm exec playwright install chromium`.
- [ ] **Step 2:** `tests/unit/sanity.test.ts`: `expect(1 + 1).toBe(2)`; `tests/e2e/admin.spec.ts`: `GET /admin` zwraca stronę z `html[lang="pl"]`.
- [ ] **Step 3:** Run: `pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:e2e --project=desktop` → wszystko PASS.
- [ ] **Step 4:** Commit: `chore: add lint, typecheck, vitest and playwright tooling`.

### Task 3: Tokeny, fonty i style bazowe

**Files:**
- Create: `src/lib/contrast.ts`, `src/app/(frontend)/styles.css`, `src/app/(frontend)/fonts.ts`
- Test: `tests/unit/contrast.test.ts`, `tests/unit/tokens.test.ts`

**Interfaces:**
- Produces: `contrastRatio(a: string, b: string): number` (hex `#RRGGBB`, wzór WCAG 2.1); zmienne CSS `--color-<token>` dla każdego tokenu z kierunku wizualnego §2 (nazwy 1:1: `ink`, `ink-muted`, `bg`, `surface`, `primary`, `primary-hover`, `accent`, `pastel-sage`, `pastel-apricot`, `pastel-butter`, `pastel-lavender`, `border`, `border-strong`, `focus`) → klasy Tailwind `bg-primary`, `text-ink` itd.; `--font-body`, `--font-heading`; klasy fontów z `fonts.ts`: `bodyFont.variable`, `headingFont.variable`.

- [ ] **Step 1: Failing tests**

```ts
// tests/unit/contrast.test.ts
expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
expect(contrastRatio('#FFFFFF', '#2E6A4E')).toBeCloseTo(6.39, 1)
expect(contrastRatio('#2e6a4e', '#ffffff')).toBeCloseTo(6.39, 1) // case-insensitive

// tests/unit/tokens.test.ts — czyta src/app/(frontend)/styles.css, wyciąga wartości z @theme
// oraz z bloku [data-contrast="high"]; asercje:
// tryb domyślny, tekst ≥ 4.5: ink/bg, ink/surface, ink-muted/bg, ink-muted/surface,
//   ink/każdy pastel, white/primary, primary/bg, primary/surface, white/accent, accent/bg
// tryb domyślny, UI ≥ 3: border-strong/bg, border-strong/surface, focus/bg
// tryb kontrastowy ≥ 7: ink/bg, primary/bg
```

- [ ] **Step 2:** Run `pnpm test:unit` → FAIL (brak modułu/pliku).
- [ ] **Step 3:** Implementuj `contrastRatio`; `styles.css`: `@import "tailwindcss"`, `@theme` z tokenami (wartości hex z §2), `html[data-contrast="high"]` nadpisujący zmienne wg §2, `html { font-size: 100% }`, `html[data-text-size="lg"] { font-size: 125% }`, `html[data-text-size="xl"] { font-size: 150% }`, `body { font-size: 1.125rem; line-height: 1.6; background: var(--color-bg); color: var(--color-ink) }`, globalny `:focus-visible` (3 px `--color-focus`, offset 2 px), `@media (prefers-reduced-motion: reduce)` wyłączający transitions. `fonts.ts`: `next/font/google` — `Atkinson_Hyperlegible_Next` (subsets `latin`, `latin-ext`, variable `--font-body`) i `Fraunces` (`latin`, `latin-ext`, weights 600, variable `--font-heading`); jeśli font niedostępny w `next/font/google` → `next/font/local` z plikami w `src/app/(frontend)/fonts/`.
- [ ] **Step 4:** Run `pnpm test:unit` → PASS.
- [ ] **Step 5:** Commit: `feat(design): add color tokens, contrast mode, text sizes and fonts`.

### Task 4: Preferencje dostępności (ciasteczko)

**Files:**
- Create: `src/lib/a11y-prefs.ts`
- Test: `tests/unit/a11y-prefs.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type TextSize = 'base' | 'lg' | 'xl'
  export type A11yPrefs = { textSize: TextSize; highContrast: boolean }
  export const A11Y_COOKIE = 'gok_a11y'
  export const DEFAULT_A11Y: A11yPrefs = { textSize: 'base', highContrast: false }
  export function parseA11yPrefs(raw: string | undefined): A11yPrefs
  export function serializeA11yPrefs(p: A11yPrefs): string   // format "<textSize>.<0|1>"
  export function htmlAttrs(p: A11yPrefs): { 'data-text-size': TextSize; 'data-contrast'?: 'high' }
  ```

- [ ] **Step 1: Failing tests**

```ts
expect(parseA11yPrefs(undefined)).toEqual(DEFAULT_A11Y)
expect(parseA11yPrefs('lg.1')).toEqual({ textSize: 'lg', highContrast: true })
expect(parseA11yPrefs('xl.0')).toEqual({ textSize: 'xl', highContrast: false })
expect(parseA11yPrefs('huge.1')).toEqual({ textSize: 'base', highContrast: true }) // zła część → domyślna
expect(parseA11yPrefs('garbage')).toEqual(DEFAULT_A11Y)
expect(parseA11yPrefs('{"textSize":"lg"}')).toEqual(DEFAULT_A11Y)              // stary/obcy format
expect(parseA11yPrefs(serializeA11yPrefs({ textSize: 'xl', highContrast: true }))).toEqual({ textSize: 'xl', highContrast: true })
expect(htmlAttrs({ textSize: 'lg', highContrast: false })).toEqual({ 'data-text-size': 'lg' })
expect(htmlAttrs({ textSize: 'base', highContrast: true })).toEqual({ 'data-text-size': 'base', 'data-contrast': 'high' })
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implementuj. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat(a11y): parse and serialize accessibility preference cookie`.

### Task 5: Globals „Dane GOK” i „Menu” + logika nawigacji i kontaktu

**Files:**
- Create: `src/globals/Settings.ts`, `src/globals/Navigation.ts`, `src/hooks/revalidateGlobal.ts`, `src/lib/navigation.ts`, `src/lib/contact.ts`, `src/lib/payload.ts`, migracja w `src/migrations/`
- Modify: `src/payload.config.ts` (globals, `prodMigrations`)
- Test: `tests/unit/navigation.test.ts`, `tests/unit/contact.test.ts`, `tests/int/globals.int.test.ts`

**Interfaces:**
- Global `settings` (label „Dane GOK”, `admin.group: 'Strona główna i menu'`): `name` (text, wymagane, domyślnie „Gminny Ośrodek Kultury w Charsznicy”), `address` (textarea, domyślnie „ul. Kolejowa 1\n32-250 Charsznica”), `phones` (array: `label` text, `number` text wymagane), `email` (email), `openingHours` (textarea), `mapLat`/`mapLng` (number), `facebookUrl`/`youtubeUrl`/`bipUrl` (text, walidacja `https://`), `signupInfo` (textarea, domyślnie „Zapisy na zajęcia telefonicznie.”). Każde pole z polską etykietą i `admin.description`.
- Global `navigation` (label „Menu”, ta sama grupa): `items` (array, label pozycji „Pozycja menu”, `admin.components.RowLabel` nie wymagane): `label` (text, wymagane), `linkType` (select: `none` „Tylko rozwija podmenu”, `list` „Lista (aktualności, wydarzenia…)”, `path` „Adres na stronie”, `external` „Link zewnętrzny”), `list` (select: `news` „Aktualności”, `events` „Wydarzenia”, `sections` „Sekcje”, `galleries` „Galeria”, `documents` „Do pobrania”, `contact` „Kontakt”; widoczne gdy `linkType=list`), `path` (text, gdy `path`), `url` (text, gdy `external`), `newTab` (checkbox), `children` (array z tymi samymi polami oprócz `children` i opcji `none`). Typy `page`/`section` dochodzą w Planie 2.
- `revalidateGlobal(tag: 'settings' | 'navigation'): GlobalAfterChangeHook` — wywołuje `revalidateTag(tag)`; podpięte w obu globals.
- `src/lib/navigation.ts`:
  ```ts
  export const LIST_ROUTES = { news: '/aktualnosci', events: '/wydarzenia', sections: '/sekcje',
    galleries: '/galeria', documents: '/do-pobrania', contact: '/kontakt' } as const
  export type NavLink = { label: string; href: string | null; external: boolean; newTab: boolean; children: NavLink[] }
  export function buildNav(items: Navigation['items']): NavLink[]
  ```
- `src/lib/contact.ts`:
  ```ts
  export type ContactLink = { kind: 'phone' | 'email' | 'facebook' | 'youtube' | 'bip'; label: string; href: string }
  export function buildContactLinks(s: Settings): ContactLink[]   // phone: href `tel:` bez spacji
  ```
- `src/lib/payload.ts`: `getSettings(): Promise<Settings>`, `getNavigation(): Promise<NavLink[]>` — Local API, cache z tagami `settings` / `navigation`.

- [ ] **Step 1: Failing unit tests**

```ts
// navigation.test.ts
buildNav([{ label: 'Kontakt', linkType: 'list', list: 'contact' }])
  // → [{ label: 'Kontakt', href: '/kontakt', external: false, newTab: false, children: [] }]
buildNav([{ label: 'X', linkType: 'path', path: 'dni-kapusty/mapa' }])[0].href   // → '/dni-kapusty/mapa'
buildNav([{ label: 'X', linkType: 'path', path: '/hala-sportowa/' }])[0].href    // → '/hala-sportowa'
buildNav([{ label: 'BIP', linkType: 'external', url: 'https://bip.example.pl', newTab: true }])[0]
  // → { href: 'https://bip.example.pl', external: true, newTab: true, ... }
buildNav([{ label: 'Pusty', linkType: 'external', url: '' }])            // → []
buildNav([{ label: 'Dom kultury', linkType: 'none', children: [] }])     // → []
buildNav([{ label: 'Dom kultury', linkType: 'none', children: [{ label: 'Aktualności', linkType: 'list', list: 'news' }] }])[0]
  // → { href: null, children: [{ label: 'Aktualności', href: '/aktualnosci', ... }] }
buildNav(null)                                                           // → []

// contact.test.ts
buildContactLinks({ phones: [{ label: 'Sekretariat', number: '41 383 00 00' }], email: 'gok@charsznica.pl' } as Settings)
  // → [{ kind:'phone', label:'Sekretariat', href:'tel:+48413830000' }, { kind:'email', label:'gok@charsznica.pl', href:'mailto:gok@charsznica.pl' }]
buildContactLinks({ phones: [{ number: '  ' }], email: '', facebookUrl: '' } as Settings)   // → []
buildContactLinks({ bipUrl: 'https://bip.x.pl' } as Settings)   // → [{ kind:'bip', label:'BIP', href:'https://bip.x.pl' }]
```
Numer: usuń spacje/myślniki; 9 cyfr → prefiks `+48`; zaczyna się od `+` → bez zmian.

- [ ] **Step 2:** Run `pnpm test:unit` → FAIL. **Step 3:** Implementuj `buildNav`, `buildContactLinks`. **Step 4:** Run → PASS.
- [ ] **Step 5:** Dodaj globals do configu, `pnpm generate:types`, `pnpm payload migrate:create init`; w `postgresAdapter` ustaw `prodMigrations: migrations` (import z `src/migrations`).
- [ ] **Step 6: Integration test** `tests/int/globals.int.test.ts` (baza `gok_test`, `getPayload({ config })`, migracje przed testami): `updateGlobal('navigation', { items: [{ label:'Dom kultury', linkType:'none', children:[{ label:'Aktualności', linkType:'list', list:'news' }] }] })` → `findGlobal` → `buildNav(...)[0].children[0].href === '/aktualnosci'`; `updateGlobal('settings', { facebookUrl: 'http://x.pl' })` rzuca błąd walidacji.
- [ ] **Step 7:** Run `pnpm test:int` → PASS; ręcznie w `/admin`: oba globals w grupie „Strona główna i menu”, wszystkie etykiety po polsku.
- [ ] **Step 8:** Commit: `feat(cms): add Settings and Navigation globals with nav/contact builders`.

### Task 6: Pasek dostępności i layout z preferencjami z ciasteczka

**Files:**
- Create: `src/components/layout/A11yToolbar.tsx`, `src/components/layout/SkipLink.tsx`
- Modify: `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/page.tsx`

**Interfaces:**
- Consumes: `A11Y_COOKIE`, `parseA11yPrefs`, `serializeA11yPrefs`, `htmlAttrs` (Task 4); `bodyFont`, `headingFont` (Task 3); `buildContactLinks`, `getSettings` (Task 5).
- Produces: `<A11yToolbar initial={A11yPrefs} contacts={ContactLink[]} />` (client); `<SkipLink />` → `href="#main"`, tekst „Przejdź do treści”; layout renderuje `<html lang="pl" {...htmlAttrs(prefs)}>` i `<main id="main" tabIndex={-1}>`.

- [ ] **Step 1:** `layout.tsx`: odczyt `cookies().get(A11Y_COOKIE)` → `parseA11yPrefs` → atrybuty na `<html>`; kolejność body: `SkipLink`, `A11yToolbar`, `Header` (Task 7), `main#main`, `Footer` (Task 7). `page.tsx`: `<h1>Gminny Ośrodek Kultury w Charsznicy</h1>` + akapit „Strona w budowie.”.
- [ ] **Step 2:** `A11yToolbar`: grupa „Rozmiar tekstu” — 3 przyciski „A”, „A+”, „A++” (`aria-pressed`, `aria-label` „Rozmiar tekstu: normalny / większy / największy”); przycisk „Kontrast” (`aria-pressed`, ikona `Contrast`); kliknięcie ustawia atrybuty na `document.documentElement` i `document.cookie = \`${A11Y_COOKIE}=${serialize}; Path=/; Max-Age=31536000; SameSite=Lax\``; po prawej linki z `contacts` (telefon z ikoną `Phone` i widocznym numerem; FB/YouTube/BIP z ikonami i `aria-label`, `target=_blank`, `rel="noopener noreferrer"`, ukryty tekst „(otwiera się w nowej karcie)”). Na mobile pasek zawija się w 2 rzędy, przyciski min. 44×44.
- [ ] **Step 3:** Weryfikacja ręczna w przeglądarce (Playwright): A++ → `html` font-size 24px, po odświeżeniu nadal 24px i w źródle HTML jest `data-text-size="xl"`.
- [ ] **Step 4:** Commit: `feat(a11y): add accessibility toolbar with server-read text size and contrast`.

### Task 7: Nagłówek, menu desktop/mobile, stopka + e2e szkieletu

**Files:**
- Create: `src/components/layout/Header.tsx`, `DesktopNav.tsx`, `MobileMenu.tsx`, `Footer.tsx`, `LogoPlaceholder.tsx`, `tests/e2e/seed.ts`, `tests/e2e/shell.spec.ts`
- Modify: `src/app/(frontend)/layout.tsx`, `playwright.config.ts` (globalSetup → seed)

**Interfaces:**
- Consumes: `NavLink`, `getNavigation`, `ContactLink`, `getSettings`, `buildContactLinks` (Task 5).
- Produces: `<Header nav={NavLink[]} />`, `<DesktopNav nav={NavLink[]} />`, `<MobileMenu nav={NavLink[]} />`, `<Footer settings={Settings} contacts={ContactLink[]} />`. `tests/e2e/seed.ts`: `seedShell(mode: 'full' | 'empty'): Promise<void>` — `full`: menu z kierunku specu §6 (Dom kultury ▸ Aktualności/Wydarzenia/Do pobrania/Galeria, Sekcje ▸ Wszystkie sekcje, Dni Kapusty (path), Pary Królewskie (path), Hala sportowa (path), Kontakt, BIP external newTab) + dane GOK z telefonem i e-mailem; `empty`: puste globals.

- [ ] **Step 1: Failing e2e** `tests/e2e/shell.spec.ts` (oba projekty, chyba że zaznaczono):
  - `skip link`: pierwszy Tab → widoczny „Przejdź do treści”; Enter → fokus na `#main`.
  - `desktop dropdown` (desktop): Tab do „Dom kultury” (przycisk, `aria-expanded="false"`), Enter → `aria-expanded="true"` i widoczny link „Aktualności”; Escape → zamknięte, fokus wraca na przycisk; bieżąca strona ma `aria-current="page"`.
  - `mobile menu` (mobile): desktopowe menu niewidoczne; przycisk „Menu” (`aria-expanded`) otwiera panel, fokus w panelu, „Dom kultury” rozwija akordeon, Escape zamyka i fokus wraca na „Menu”.
  - `text size persists`: klik „A++” → `getComputedStyle(html).fontSize === '24px'`; reload → nadal `24px`.
  - `contrast mode`: klik „Kontrast” → `html[data-contrast="high"]`; reload → atrybut obecny w odpowiedzi serwera (`page.request.get('/')` zawiera `data-contrast="high"` z tym samym ciasteczkiem).
  - `no horizontal scroll at A++` (mobile): po A++ i otwarciu menu `document.documentElement.scrollWidth <= window.innerWidth`.
  - `external link`: link BIP ma `rel` zawierające `noopener` i tekst „(otwiera się w nowej karcie)”.
  - `no empty links` (seed `empty`): brak `a[href=""]`, `a[href="tel:"]`, `a[href="mailto:"]`; nagłówek i stopka renderują się.
  - `axe`: `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()` → `violations` puste, w trybie domyślnym i kontrastowym, z zamkniętym i otwartym menu.
- [ ] **Step 2:** Run `pnpm test:e2e` → FAIL.
- [ ] **Step 3:** Implementuj zgodnie z kierunkiem wizualnym §6 („Header”) i specem §8: logo (placeholder: nazwa GOK tekstem w `--font-heading` + listek SVG `aria-hidden`; link do `/`) po lewej, `DesktopNav` po prawej od `lg`; wzorzec *disclosure navigation* — pozycja z `href` i dziećmi: link + osobny przycisk rozwijania z `aria-label` „Podmenu: <label>”; pozycja bez `href`: sam przycisk; zamykanie: Escape, klik poza, fokus poza; `aria-current="page"` po `usePathname()`. `MobileMenu` poniżej `lg`: przycisk z ikoną `Menu` + tekstem „Menu” w prawym górnym rogu, panel na pełny ekran (`role="dialog"`, `aria-modal`, pułapka fokusu, `aria-label` „Menu główne”), akordeony, pozycje min. 48 px. `Footer`: tło `pastel-sage`, kolumny: nazwa+adres+godziny / kontakt z `contacts` / linki „Polityka prywatności” `/polityka-prywatnosci`, „Deklaracja dostępności” `/deklaracja-dostepnosci`, BIP; `© <rok> Gminny Ośrodek Kultury w Charsznicy`.
- [ ] **Step 4:** Run `pnpm test:e2e` → PASS. Zrzuty ekranu desktop/mobile/kontrast (Playwright) — porównaj z kierunkiem wizualnym.
- [ ] **Step 5:** Commit: `feat(layout): add header, desktop/mobile navigation and footer`.

### Task 8: Obraz produkcyjny Docker

**Files:**
- Create: `Dockerfile`, `.dockerignore`
- Modify: `next.config.ts` (`output: 'standalone'`)

**Interfaces:**
- Produces: obraz nasłuchujący na `3000`, env: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`; media w `/app/media` (wolumen); migracje uruchamiane przy starcie (`prodMigrations`); użytkownik nie-root.

- [ ] **Step 1:** Wieloetapowy Dockerfile (deps → build → runner na `node:22-alpine`), kopiuje `.next/standalone`, `.next/static`, `public`; `.dockerignore` wyklucza `node_modules`, `.next`, `.env`, `media`, `tests`, `docs`.
- [ ] **Step 2:** Weryfikacja: `docker build -t gok:local .` i uruchomienie z pustą bazą (sieć z kontenerem postgres) → `curl -s localhost:3000/ | grep 'lang="pl"'` OK, `/admin` odpowiada 200, w logach wykonane migracje.
- [ ] **Step 3:** Commit: `build: add production Docker image with standalone output`.

### Task 9: CI (GitHub Actions)

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: workflow `ci` (na `pull_request` i `push` do `main`): job z usługą `postgres:17-alpine`, kroki `pnpm install --frozen-lockfile` → `lint` → `typecheck` → `test:unit` → `test:int` → `build` → `test:e2e` (artefakt `playwright-report` przy porażce). Akcje przypięte do konkretnych wersji.

- [ ] **Step 1:** Utwórz repo zdalne (od Kamila), `git remote add origin …`, push `main`.
- [ ] **Step 2:** Weryfikacja: `gh run watch` → `ci` zielony.
- [ ] **Step 3:** Commit: `ci: add lint, test and build workflow`.

### Task 10: Serwer i automatyczny deploy na staging

**Files:**
- Create: `deploy/compose.server.yml`, `deploy/Caddyfile`, `deploy/.env.server.example`, `.github/workflows/deploy-staging.yml`, `docs/ops/serwer.md`

**Interfaces:**
- Consumes: obraz z Task 8, workflow `ci` z Task 9.
- Produces: `compose.server.yml` z usługami `caddy` (`caddy:2-alpine`, porty 80/443, wolumeny `caddy_data`, `caddy_config`), `postgres` (`postgres:17-alpine`, baza `gok_staging`), `app-staging` (`ghcr.io/<owner>/gok-charsznica:${STAGING_TAG:-staging}`, wolumen `media_staging:/app/media`); `Caddyfile`: `{$STAGING_DOMAIN}` → `basic_auth` (użytkownik `gok`, hash z env), `header X-Robots-Tag "noindex, nofollow"`, `reverse_proxy app-staging:3000`. Sekrety GitHub: `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY`, `STAGING_KNOWN_HOSTS`.
- `deploy-staging.yml`: po sukcesie `ci` na `main` → build i push obrazu z tagami `sha-<short>` i `staging` do GHCR → SSH: `cd /opt/gok && docker compose -f compose.server.yml pull app-staging && docker compose -f compose.server.yml up -d app-staging`.

- [ ] **Step 1:** `docs/ops/serwer.md` — instrukcja przygotowania VPS (po polsku): użytkownik `deploy` z kluczem SSH, wyłączone logowanie hasłem i root, `ufw` (22, 80, 443), `fail2ban`, `unattended-upgrades`, Docker + compose plugin, `docker login ghcr.io` tokenem tylko do odczytu, katalog `/opt/gok` z plikami z `deploy/` i `.env` (z `.env.server.example`), generowanie hasha: `docker run --rm caddy:2-alpine caddy hash-password`.
- [ ] **Step 2:** Przygotuj serwer wg instrukcji (z Kamilem — wymaga jego dostępu); dodaj sekrety w repo.
- [ ] **Step 3:** Push na `main` → `deploy-staging` zielony.
- [ ] **Step 4:** Weryfikacja:
  - `curl -sI https://<staging>/` → `401` (bez hasła), ważny certyfikat.
  - `curl -sI -u gok:<hasło> https://<staging>/` → `200` i `x-robots-tag: noindex, nofollow`.
  - `https://<staging>/admin` po zalogowaniu Basic Auth → ekran panelu po polsku; utworzenie konta admina; zmiana pozycji w „Menu” widoczna na stronie po odświeżeniu (revalidacja działa).
- [ ] **Step 5:** Commit: `ci: deploy to staging behind basic auth`; zaktualizuj `docs/plany/00-mapa-planow.md` (Plan 1 → zrobiony, data).
