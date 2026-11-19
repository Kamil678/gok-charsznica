# Strona GOK Charsznica — opis projektu

**Data:** 2026-11-19 · **Wykonawca:** Kamil Pigulak · **Status:** zaakceptowany 2026-11-19 · kierunek wizualny: `docs/design/kierunek-wizualny.md`
**Źródła:** `docs/klient/oferta-2026-11-06.txt`, `docs/klient/spotkanie-2026-11-03.txt`

Oznaczenia: **[ustalone]** – wynika z oferty / spotkania / decyzji Kamila · **[propozycja]** – decyzja projektowa do skorygowania · **[do GOK]** – wymaga odpowiedzi klienta.

---

## 1. Cel i „dlaczego”

GOK potrzebuje nowej strony, na której mieszkańcy (wszystkie grupy wiekowe, w tym seniorzy) szybko sprawdzą **co się dzieje** (wydarzenia, aktualności), **jakie są zajęcia stałe** (sekcje) i **jak się skontaktować** (zapisy są telefoniczne). Pracownik GOK ma samodzielnie i bez stresu dodawać treści przez prosty panel. Strona musi spełniać WCAG 2.1 AA (obowiązek ustawowy instytucji publicznej).

Sukces =
- mieszkaniec na telefonie w ≤ 2 kliknięciach znajduje najbliższe wydarzenie lub godziny zajęć sekcji i numer telefonu,
- redaktor dodaje wydarzenie z plakatem w < 5 minut po 2-godzinnym szkoleniu, bez dzwonienia do wykonawcy,
- audyt axe/Lighthouse bez błędów krytycznych, ręczny test klawiaturą i czytnikiem ekranu zaliczony,
- strona utrzymywalna w ramach przyszłej opieki technicznej (aktualizacje, kopie, monitoring).

## 2. Cele, nie-cele, anty-cele

**Cele [ustalone]:** strona główna z banerami, aktualności+wydarzenia z kategoriami, sekcje z podstronami, strony tematyczne z podstronami (Dni Kapusty, Pary Królewskie, Hala Sportowa), galeria, dokumenty PDF, O nas, Kontakt z mapą, linki FB/YouTube/BIP, edytowalne menu z podmenu, szkice + podgląd, RWD, WCAG 2.1 AA (rozmiar tekstu + wersja kontrastowa), baner cookies, miejsce na politykę prywatności/RODO, podstawowe SEO, SSL, szkolenie + instrukcja PDF.

**Nie-cele (w tym etapie) [ustalone]:** zapisy online, rezerwacja sal, płatności, newsletter, wersja obcojęzyczna, formularz kontaktowy, kalendarz miesięczny, wyszukiwarka, wiele kont/ról, autopublikacja na Facebooka, własny hosting wideo. Kalendarz, wyszukiwarka, formularz i konta redaktorów to płatne opcje na później — architektura ma je umożliwiać bez przebudowy.

**Anty-cele (porażka mimo „działania”):**
- panel, w którym redaktor może rozbić układ strony albo gubi się w polach technicznych,
- karuzele z autoodtwarzaniem, drobny tekst, pastelowy tekst na pastelowym tle (nieczytelne dla seniorów, łamie WCAG),
- osadzenia stron trzecich (Google Maps, YouTube, piksel FB) ładujące ciasteczka przed zgodą,
- zepsucie poczty `@…` GOK przy zmianie DNS,
- wydarzenia, które po terminie dalej wiszą jako „nadchodzące”.

## 3. Ograniczenia

- Budżet 5 500 zł netto, ~6 tygodni od materiałów; do 3 tur poprawek na wersji testowej. **[ustalone]**
- Brak osobnego projektu graficznego — od razu działająca wersja testowa. **[ustalone]**
- Hosting i domena własnością GOK, opłacane przez GOK (~300–600 zł/rok). **[ustalone]**
- Po zapłacie GOK otrzymuje majątkowe prawa do kodu → kod czytelny, udokumentowany, przekazywalny. **[ustalone]**
- Gwarancja 3 miesiące; potem planowana opieka techniczna. **[ustalone]**
- Domeną zarządza Tomek Adler; poczta GOK nie może ucierpieć. **[ustalone]**
- Kamil na co dzień pracuje w Vue/Nuxt, React/Next to nowy teren (świadoma nauka). **[ustalone]**

## 4. Rozważone podejścia

| Podejście | Za | Przeciw | Werdykt |
|---|---|---|---|
| **A. Next.js + Payload CMS 3 w jednej aplikacji** | 1 aplikacja/1 deploy; szkice, wersje, live preview, media, bloki wbudowane; konta/role bez licencji; TypeScript end-to-end; nauka Reacta | wymaga VPS (Node+Postgres); panel trzeba „uczłowieczyć” konfiguracją; Payload często wydaje wersje | **WYBRANE** przez Kamila |
| B. Nuxt (front) + Payload headless | znany stos na froncie | 2 aplikacje, 2 deploye, live preview przez API, synchronizacja typów | odrzucone – większy koszt utrzymania |
| Statamic | najszybsza budowa, gotowy edytor nawigacji | niszowy stos, konta redaktorów = płatna licencja Pro | odrzucone |
| Laravel + Filament | pełna kontrola, tani hosting | szkice/podgląd/menu do zbudowania od zera – nie mieści się w budżecie panelu | odrzucone |
| WordPress | najtańszy hosting, wszystko gotowe | Kamil nie chce WP | odrzucone **[ustalone]** |

## 5. Architektura

**Stos [ustalone: A; wersje – propozycja]:**
- **Next.js (App Router)** + **Payload CMS 3** w jednym repozytorium i jednym procesie (`/admin` = panel, reszta = strona publiczna). Najnowsze stabilne wersje w dniu startu, **przypięte dokładnie** w `package.json` (bez `^`).
- **TypeScript** strict, **pnpm**.
- **PostgreSQL** (adapter `@payloadcms/db-postgres`) + migracje Payloada w repo.
- Edytor treści: **Lexical** (domyślny w Payload 3), z ograniczonym zestawem funkcji (nagłówki H2–H4, pogrubienie, kursywa, listy, linki, cytat). Bez kolorów i rozmiarów czcionek.
- Style: **Tailwind CSS** z tokenami kolorów w zmiennych CSS (potrzebne do trybu kontrastowego). **[propozycja]**
- Obrazy: `next/image` (AVIF/WebP, responsywne rozmiary), rozmiary generowane też przez Payload (`sharp`).
- Dane po stronie publicznej pobierane przez **Payload Local API** w React Server Components (bez REST/GraphQL). Komponenty klienckie (`'use client'`) tylko tam, gdzie jest interakcja.
- Odświeżanie: strony statyczne/ISR + **revalidacja na żądanie** z hooków `afterChange`/`afterDelete` Payloada (`revalidatePath`/`revalidateTag`), plus revalidacja czasowa (np. co 1 h) list „nadchodzące”, żeby wydarzenia same przechodziły do archiwum. **[propozycja]**
- Strefa czasowa: przechowywanie w UTC, wyświetlanie zawsze w `Europe/Warsaw`, polskie formaty dat (`Intl.DateTimeFormat('pl-PL')`). **[propozycja]**
- Slugi generowane automatycznie z tytułu z transliteracją polskich znaków (ą→a, ł→l…), edytowalne w „Zaawansowane”.

**Mapowanie Nuxt → Next (dla Kamila):** `pages/` → `app/**/page.tsx`; `layouts/` → `layout.tsx`; `useFetch/useAsyncData` → `async` Server Component wołający Local API; composables → hooki (`useState`, `useEffect`) tylko w komponentach klienckich; `nuxt.config` runtimeConfig → `process.env` + `next.config`; `<NuxtImg>` → `next/image`.

## 5a. Konwencje językowe [propozycja]

| Warstwa | Język | Przykład |
|---|---|---|
| Wszystko, co widzi mieszkaniec (treści, menu, przyciski, komunikaty, `aria-label`) | polski | „Najbliższe wydarzenia”, „Przejdź do treści” |
| Adresy URL strony publicznej | polski, bez znaków diakrytycznych, z myślnikami | `/aktualnosci`, `/do-pobrania`, `/dni-kapusty/mapa` |
| Panel: etykiety kolekcji, pól, zakładek, opisy, walidacje | polski (`labels`, `admin.description`, tłumaczenia `pl`) | zakładka „Zaawansowane”, pole „Data i godzina rozpoczęcia” |
| Kod: slugi kolekcji, nazwy pól, tabele w bazie, zmienne, komponenty, pliki | angielski | `posts.eventStart`, `EventCard.tsx` |
| Komentarze w kodzie, README, commity | angielski (łatwiej przekazać kod innemu wykonawcy) | — |
| Dokumentacja dla klienta (instrukcja, specyfikacja) | polski | `docs/instrukcja-redaktora/` |

Uzasadnienie: polski tam, gdzie czyta człowiek z GOK lub mieszkaniec (użyteczność, WCAG 3.1.1 – `lang="pl"`, SEO pod polskie frazy); angielski tam, gdzie czyta programista (zgodność z ekosystemem, brak problemów z polskimi znakami w identyfikatorach i bazie). Jedyny „przeciek” angielskiego do redaktora to adres w pasku przeglądarki panelu (`/admin/collections/posts`) – akceptowalne, nikt go nie wpisuje ręcznie.

## 6. Model treści (Payload)

### Kolekcje

**`posts` — „Aktualności i wydarzenia”** (wersje + szkice + autozapis + live preview)
- `title` (wymagane), `slug`, `publishedAt` (data publikacji, domyślnie teraz)
- `excerpt` – krótki opis do kart (max ~200 znaków, licznik)
- `cover` – zdjęcie/plakat (upload `media`, wymagane)
- `content` – treść (Lexical)
- `categories` – relacja wiele do `categories`
- `isEvent` – przełącznik „To wydarzenie”; gdy włączony pokazuje grupę **Wydarzenie**:
  - `eventStart` – data + godzina (wymagane gdy `isEvent`)
  - `eventEnd` – opcjonalnie (wydarzenia kilkudniowe, np. Dni Kapusty)
  - `location` – tekst (domyślnie „GOK Charsznica, ul. Kolejowa 1”)
  - `ticketInfo` – opcjonalny krótki tekst („wstęp wolny”, „bilety w GOK”)
- `gallery` – opcjonalna relacja do `galleries`
- `attachments` – opcjonalna relacja do `documents`
- `seo` – plugin SEO (w zakładce „Zaawansowane”, uzupełniane automatycznie)

Reguła „nadchodzące”: `isEvent = true` AND (`eventEnd ?? eventStart`) ≥ teraz, sortowane rosnąco po `eventStart`.

**`categories` — „Kategorie”**: `name`, `slug`. Startowo **[propozycja]**: Wydarzenia, Ogłoszenia, Dla dzieci, Koncerty, Sport, Sekcje — GOK może zmieniać.

**`sections` — „Sekcje (zajęcia stałe)”** (wersje + szkice)
- `name`, `slug`, `cover`, `shortDescription`, `description` (Lexical)
- `instructor` – prowadzący (tekst)
- `schedule` – tablica terminów: `day` (pn–nd), `timeFrom`, `timeTo`, `group` (np. „dzieci 7–10 lat”), `place`
- `price` – opcjonalny tekst („bezpłatne”, „50 zł/mies.”)
- `signupInfo` – tekst o zapisach (domyślnie „Zapisy telefonicznie: …” z ustawień)
- `photos` – tablica zdjęć (lub relacja do `galleries`)
- `extraFields` – tablica `label` / `value` (rozszerzalność z oferty: „zakres informacji można rozszerzyć”)
- `order` – kolejność na liście (sortowanie przeciąganiem w panelu)
- `season` – tekst, np. „2026/2027” (zajęcia definiowane we wrześniu) **[propozycja]**

**`pages` — „Strony”** (wersje + szkice + live preview; plugin `nested-docs` → hierarchia rodzic/dziecko i URL z breadcrumbs)
- `title`, `slug`, `parent`, `hero` (opcjonalne zdjęcie)
- `layout` – bloki (ograniczony zestaw):
  - **Tekst** (Lexical)
  - **Galeria** (relacja do `galleries`)
  - **Mapa / plan** – wariant „lokalizacja” (współrzędne + opis, mapa OSM ładowana po kliknięciu) lub „plan obrazkowy” (obraz, np. plan Dni Kapusty, z opisem tekstowym dla dostępności)
  - **Pliki do pobrania** (relacja do `documents`)
  - **Przycisk / link** (wewnętrzny lub zewnętrzny)
  - **Kafelki podstron** (automatyczna lista dzieci danej strony – np. Dni Kapusty → Mapa, Galeria, Program)
  - **Wideo YouTube** (URL, ładowane po kliknięciu, `youtube-nocookie.com`)
  - **Wydarzenia z kategorii** (np. na stronie Dni Kapusty pokaż wpisy z kategorii „Dni Kapusty”) **[propozycja]**

Strony startowe: O nas, Dni Kapusty (+ podstrony), Pary Królewskie, Hala Sportowa, Polityka prywatności, Deklaracja dostępności.

**`galleries` — „Galerie”**: `title`, `slug`, `date`, `cover` (domyślnie 1. zdjęcie), `images` (tablica: `image`, `caption`), opcjonalnie `relatedPost`. Realnie 7–10 zdjęć na galerię; upload wielu plików naraz (bulk upload Payloada).

**`documents` — „Dokumenty do pobrania”**: `title`, `file` (upload; PDF/DOC/DOCX/ODT, max np. 20 MB), `group` (np. Regulaminy, Formularze, Inne), `date`, `description`. Na liście pokazujemy typ i rozmiar pliku.

**`media` — „Zdjęcia i grafiki”** (upload): **`alt` wymagane** (z podpowiedzią, jak je pisać), `caption`, rozmiary: thumbnail, card, poster (pionowy), hero, og (1200×630). Limit rozmiaru uploadu ~15 MB, automatyczna kompresja.

**`users`** – jedno konto administratora **[ustalone]**; kolekcja przygotowana pod role (`admin`/`editor`) bez ich włączania, żeby opcja „konta redaktorów” była tania.

### Globals (pojedyncze ustawienia)

**`navigation` — „Menu”**: tablica pozycji z przeciąganiem; każda pozycja: `label`, `type` (strona / sekcja / lista: aktualności, wydarzenia, sekcje, galerie, dokumenty, kontakt / link zewnętrzny), `newTab`; pozycja może mieć `children` (jeden poziom podmenu — wystarczy i jest czytelniejsze na telefonie). **[propozycja: max 2 poziomy]**

Domyślne menu (wg oferty):
- **Dom kultury** → Aktualności, Wydarzenia, Do pobrania, Galeria, O nas
- **Sekcje** → (lista sekcji: Gitara, Karate, …) + „Wszystkie sekcje”
- **Dni Kapusty** → podstrony
- **Pary Królewskie**
- **Hala sportowa**
- **Kontakt**

**`homepage` — „Strona główna”** (wersje + szkice + live preview)
- `banners` – tablica 1–3 banerów: `image`, `title`, `text`, `link` (do wpisu/strony/URL), `buttonLabel`, `showUntil` (opcjonalnie – baner sam znika po dacie)
- `upcomingCount` (domyślnie 4), `newsCount` (domyślnie 3), `showSections` (tak/nie)

**`settings` — „Dane GOK i stopka”**: nazwa, adres, telefon(y), e-mail, godziny otwarcia, współrzędne mapy, linki FB / YouTube / BIP, tekst informacji o zapisach, dane do deklaracji dostępności (data publikacji, data aktualizacji, osoba kontaktowa, wynik oceny), tekst baneru cookies.

## 7. Mapa strony i adresy URL

| URL | Zawartość |
|---|---|
| `/` | Strona główna |
| `/aktualnosci` | Wszystkie wpisy (aktualności + wydarzenia), filtr kategorii (`?kategoria=`), paginacja |
| `/aktualnosci/[slug]` | Wpis / wydarzenie |
| `/wydarzenia` | Ten sam zbiór: zakładki „Nadchodzące” / „Minione” |
| `/sekcje`, `/sekcje/[slug]` | Lista sekcji / sekcja |
| `/galeria`, `/galeria/[slug]` | Galerie |
| `/do-pobrania` | Dokumenty pogrupowane |
| `/kontakt` | Dane, godziny, mapa, linki |
| `/[...slug]` | Strony z `pages` (np. `/dni-kapusty/mapa`) |
| `/deklaracja-dostepnosci`, `/polityka-prywatnosci` | Strony z `pages` (wymagane) |
| `/mapa-strony` | Mapa strony (pomocna dla dostępności) **[propozycja]** |
| `/sitemap.xml`, `/robots.txt` | Generowane |
| `/admin` | Panel Payload |

Kolizje slugów stron z trasami stałymi blokowane walidacją.

## 8. UX / UI

### Zasady
- **Czytelność przed efektem**: bazowy tekst 18 px, interlinia ~1.6, szerokość linii ≤ 75 znaków, pola klikalne min. 44×44 px (cel 48).
- **Bez karuzel z autoodtwarzaniem.** Banery jako statyczny układ 1 duży + 2 mniejsze.
- **Daty widoczne od razu**: każda karta wydarzenia ma „plakietkę daty” (dzień, miesiąc, godzina) – najważniejsza informacja dla mieszkańca.
- **Telefon zawsze pod ręką**: w górnym pasku i na każdej podstronie sekcji („Zapisy: tel. …” jako link `tel:`).
- **Plakaty pionowe** wyświetlane w całości (`object-fit: contain` na rozmytym tle tego samego obrazu), nie przycinane.

### Nagłówek i nawigacja
- Pasek narzędzi (desktop i mobile): **A / A+ / A++** (rozmiar tekstu), **Kontrast**, ikony FB / YouTube / **BIP**, telefon.
- Pod nim: **logo po lewej, menu po prawej** (interpretacja notatki „menu po prawej”) **[propozycja – potwierdzić]**.
- Desktop: rozwijane podmenu na kliknięcie i hover-intent, wzorzec *disclosure navigation* (WAI-ARIA), pełna obsługa klawiatury, `aria-expanded`, `aria-current="page"`.
- Mobile: przycisk „Menu” (ikona + napis) w prawym górnym rogu → panel na pełny ekran, podmenu jako akordeony, duże pozycje.
- Link „Przejdź do treści” jako pierwszy element.

### Szkic strony głównej (desktop)
```
┌──────────────────────────────────────────────────────────────┐
│ ☎ 41 xxx xx xx   A A+ A++  ◐ Kontrast        f  ▶  BIP       │
├──────────────────────────────────────────────────────────────┤
│ [LOGO GOK]        Dom kultury▾ Sekcje▾ Dni Kapusty▾ Hala  Kontakt │
├──────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────┐ ┌────────────────────────┐ │
│ │  BANER 1 (najbliższe          │ │ BANER 2 (Dni Kapusty)  │ │
│ │  wydarzenie / plakat)         │ ├────────────────────────┤ │
│ │  Tytuł · data · [Szczegóły]   │ │ BANER 3 (Hala sport.)  │ │
│ └───────────────────────────────┘ └────────────────────────┘ │
│                                                              │
│ Najbliższe wydarzenia                      Wszystkie →       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │
│ │12 GRU│ │14 GRU│ │20 GRU│ │06 STY│   karta: plakat, data,   │
│ │plakat│ │plakat│ │plakat│ │plakat│   godzina, tytuł, miejsce│
│ └──────┘ └──────┘ └──────┘ └──────┘                          │
│                                                              │
│ Aktualności                                Wszystkie →       │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│ │ zdjęcie    │ │ zdjęcie    │ │ zdjęcie    │                 │
│ │ tytuł/lead │ │ tytuł/lead │ │ tytuł/lead │                 │
│ └────────────┘ └────────────┘ └────────────┘                 │
│                                                              │
│ Nasze sekcje:  [Gitara] [Karate] [ ... ]  Wszystkie →        │
├──────────────────────────────────────────────────────────────┤
│ STOPKA: adres · telefon · e-mail · godziny · mapa (po klik.) │
│ FB · YouTube · BIP · Polityka prywatności · Deklaracja dost. │
└──────────────────────────────────────────────────────────────┘
```
Mobile: baner 1 → banery 2–3 jako pełnoszerokie kafle → wydarzenia jako lista z plakietką daty (nie karuzela) → aktualności → sekcje → stopka.

### Podstrona sekcji
Nagłówek ze zdjęciem → ramka „Kiedy i gdzie” (tabela terminów: dzień, godzina, grupa, miejsce) + prowadzący + cena + **„Zapisy: tel. …”** → opis → zdjęcia → inne sekcje.

### Wygląd [propozycja]
- Kolory wyprowadzone z logo (po otrzymaniu wektora): 1 kolor główny + 2–3 pastelowe kolory tła do sekcji i kart; **tekst zawsze ciemny na pastelu** (kontrast ≥ 4.5:1, duże nagłówki ≥ 3:1). Paleta weryfikowana narzędziem przed pierwszą prezentacją.
- Typografia: krój z pełnymi polskimi znakami, zaprojektowany pod czytelność — kandydat: **Atkinson Hyperlegible Next** (tekst) + cieplejszy krój nagłówków dobrany do logo. Samohostowane przez `next/font` (bez Google Fonts z zewnątrz → RODO).
- Zaokrąglone karty, miękkie cienie, dużo światła — „nowocześniej niż dk.wolbrom.pl”, inspiracje: Dworek Białoprądnicki (najbliższe wydarzenie na górze), CK Podgórza (narzędzia dostępności w nagłówku).
- Na pierwszą prezentację: wersja testowa w 1 wariancie kolorystycznym + przełącznik 2 alternatywnych palet tylko na wersji testowej, żeby GOK wybrał kolory na żywo. **[propozycja]**

## 9. Dostępność (WCAG 2.1 AA)

- Semantyka: `lang="pl"`, landmarki (`header`, `nav`, `main`, `footer`), jedna `h1` na stronę, poprawna hierarchia nagłówków, `<time datetime>` dla dat.
- **Rozmiar tekstu**: 3 stopnie (100/125/150%) przez skalowanie `font-size` na `html` (cały układ w `rem`), zapamiętane w ciasteczku niezbędnym → ustawione po stronie serwera, bez migania.
- **Wersja kontrastowa**: osobny motyw (np. czarne tło / żółty tekst i linki / białe obramowania) przez `data-contrast` na `html` i zmienne CSS; również z ciasteczka.
- Widoczny focus wszędzie, pełna obsługa klawiatury (menu, galeria-lightbox z pułapką fokusu, ESC, strzałki), `prefers-reduced-motion`.
- Wymagany `alt` w panelu; dekoracyjne obrazy jawnie oznaczane; podpowiedź dla plakatów: „przepisz najważniejsze informacje z plakatu w treści wpisu”.
- Linki do plików z informacją o typie i rozmiarze („Regulamin (PDF, 240 KB)”). Dostępność samych PDF-ów to odpowiedzialność GOK – opisane w instrukcji.
- Mapy i wideo: zawsze z alternatywą tekstową (adres, opis dojazdu).
- **Testy**: axe-core w Playwright na kluczowych szablonach (CI), Lighthouse CI (dostępność ≥ 95), ręcznie: klawiatura, NVDA (Windows) / VoiceOver, powiększenie 200% i 400% (reflow), tryb kontrastowy.
- Deklaracja dostępności: strona generowana z pól w `settings` wg wzoru ustawowego; wykonawca przekazuje oświadczenie. **[ustalone]**

## 10. Prywatność, cookies, RODO

- Domyślnie **tylko ciasteczka niezbędne** (preferencje dostępności, zgoda, sesja panelu).
- Treści zewnętrzne (YouTube, mapa) ładowane **dopiero po kliknięciu** („Pokaż mapę – zostaną załadowane dane z OpenStreetMap”), więc nie potrzeba zgody z góry.
- Baner cookies informacyjny z możliwością rozszerzenia o kategorie (analityka) – przygotowany technicznie. **[ustalone: baner]**
- Analityka: **brak w zakresie**. Opcja: Umami/Plausible bez ciasteczek. **[propozycja]**
- Fonty i wszystkie zasoby z własnego serwera.
- Treść polityki prywatności i klauzul dostarcza GOK (IOD). **[ustalone]**

## 11. SEO

Plugin `@payloadcms/plugin-seo` (tytuł, opis, obraz OG – domyślnie z treści), `generateMetadata` w Next, kanoniczne URL-e, `sitemap.xml`, `robots.txt`, dane strukturalne JSON-LD: `Organization`/`LocalBusiness` (GOK) i `Event` dla wydarzeń, breadcrumbs. Wersja testowa: `noindex` + hasło.

## 12. Panel — dopasowanie do redaktora

- Panel po polsku (`@payloadcms/translations` pl), własne etykiety i opisy pól.
- Grupy w nawigacji panelu: **Treści** (Aktualności i wydarzenia, Sekcje, Strony, Galerie, Dokumenty) · **Strona główna i menu** (Strona główna, Menu, Dane GOK) · **Pliki** (Zdjęcia) · **Ustawienia** (Kategorie, Użytkownicy).
- **Własny ekran startowy** (custom dashboard, React): kafle „Dodaj wydarzenie”, „Dodaj aktualność”, „Zmień banery”, „Dodaj dokument”, lista ostatnich edycji i najbliższych wydarzeń.
- Pola techniczne (slug, SEO, daty systemowe) w zakładce/sidebarze „Zaawansowane”.
- Live preview obok formularza (desktop/tablet/telefon), przyciski „Zapisz szkic” / „Opublikuj”, historia wersji z przywracaniem.
- Walidacje z ludzkimi komunikatami („Dodaj datę i godzinę wydarzenia”).
- Reset hasła admina mailem – wymaga SMTP (patrz §13). 

## 13. Infrastruktura, środowiska, wdrożenia

### Środowiska
| Środowisko | Gdzie | Dostęp |
|---|---|---|
| **dev** | lokalnie: `pnpm dev` + Postgres w Docker Compose | Kamil |
| **test (staging)** | VPS, `test.<domena-gok>` (do czasu dostępu do domeny GOK: subdomena domeny Kamila) | Basic Auth (Caddy) + `X-Robots-Tag: noindex` |
| **prod** | ten sam VPS, osobny stos (osobna baza, osobne media), domena GOK | publiczny |

### Serwer [propozycja]
- VPS w UE (Hetzner CX22 / OVH VPS – 2 vCPU, 4 GB RAM, 40+ GB dysku, ~250–400 zł/rok). **Konto u dostawcy zakładane na GOK** (faktury na GOK), Kamil dostaje dostęp techniczny. **[do GOK]**
- Ubuntu LTS, `unattended-upgrades`, firewall (22 tylko z kluczem, 80/443), fail2ban.
- **Docker Compose**: `caddy` (reverse proxy, automatyczny SSL Let's Encrypt, HTTP→HTTPS, nagłówki bezpieczeństwa) · `app-prod` · `app-test` · `postgres` (2 bazy lub 2 instancje). Media na wolumenie dyskowym (małe galerie → wystarczy); adapter S3 możliwy później bez zmian w treściach.
- Obraz aplikacji: Next `output: 'standalone'`, wieloetapowy Dockerfile, migracje Payloada uruchamiane przy starcie kontenera (`payload migrate`).

### CI/CD (GitHub Actions)
- Na każdy PR: lint (ESLint), typecheck, testy jednostkowe (Vitest), build.
- Push na `main` → build obrazu → **GHCR** → deploy na **test** (SSH: `docker compose pull && up -d`) → smoke test + Playwright/axe na wersji testowej.
- Deploy na **prod**: ręczne zatwierdzenie (GitHub Environment „production”) tego samego obrazu, który przeszedł test.
- Dependabot/Renovate: aktualizacje grupowane, Payload/Next tylko po teście na staging.

### Uruchomienie produkcji (tydzień 6)
1. Z wyprzedzeniem: zrzut **wszystkich** obecnych rekordów DNS (A, AAAA, MX, TXT/SPF/DKIM/DMARC, CNAME) i ustalenie z Tomkiem Adlerem, kto i kiedy zmienia; obniżenie TTL do 300 s dzień wcześniej.
2. Krótkie „zamrożenie” treści na wersji testowej.
3. `pg_dump` bazy test → `pg_restore` do prod + `rsync` mediów; podmiana adresu bazowego (`NEXT_PUBLIC_SERVER_URL`).
4. Zmiana **tylko** rekordów A/AAAA dla `@` i `www` (MX i reszta bez zmian). Caddy wystawia certyfikaty.
5. Testy po starcie: SSL, przekierowania `www`/`http`, sitemap, formularz logowania, poczta GOK działa (wysłać/odebrać testowy mail).
6. Przekierowania 301 ze starych adresów, jeśli obecna strona ma ważne linki. **[do GOK: czy jest stara strona?]**
7. Odświeżenie wersji testowej kopią produkcji.

### Kopie, monitoring
- Codziennie: `pg_dump` + media → **restic** do zewnętrznego magazynu w UE (np. Hetzner Storage Box / Backblaze B2 EU), szyfrowane; retencja 7 dni / 4 tygodnie / 6 miesięcy. Test odtworzenia przed odbiorem.
- Monitoring dostępności (Uptime Kuma lub Better Stack) z alertem na mail/telefon Kamila; błędy aplikacji: Sentry (darmowy plan).
- SMTP do resetu hasła: skrzynka GOK lub darmowy plan dostawcy transakcyjnego (np. Brevo). **[propozycja]**

## 14. Struktura repozytorium [propozycja]
```
src/
  app/
    (frontend)/        # strona publiczna: layout, page.tsx, aktualnosci/, wydarzenia/, sekcje/, galeria/, do-pobrania/, kontakt/, [...slug]/
    (payload)/         # panel /admin i API generowane przez Payload
  collections/         # posts, categories, sections, pages, galleries, documents, media, users
  globals/             # navigation, homepage, settings
  blocks/              # definicje bloków + komponenty renderujące
  components/          # UI strony (Header, Nav, EventCard, DateBadge, A11yToolbar, CookieBanner, Lightbox…)
  admin/               # komponenty panelu (Dashboard)
  lib/                 # daty (Europe/Warsaw), slugify PL, zapytania (upcoming events), revalidate
  payload.config.ts
tests/ (unit, e2e + axe)
docker/ (Dockerfile, compose.*.yml, Caddyfile)
docs/ (klient, specs, instrukcja-redaktora)
```

## 15. Testy

- Jednostkowe (Vitest, TDD): logika dat i „nadchodzące/minione”, formatowanie PL, slugify, budowanie URL z hierarchii stron, mapowanie menu.
- E2E (Playwright): strona główna, wpis-wydarzenie, sekcja, strona tematyczna z podstronami, menu mobilne z klawiatury, przełączniki A+/kontrast, baner cookies; axe na każdym szablonie.
- Panel: scenariusz „dodaj wydarzenie z plakatem → szkic → podgląd → publikacja → pojawia się na głównej”.

## 16. Harmonogram (zgodny z ofertą)

| Tydzień | Zakres |
|---|---|
| 1 | Repo, CI, VPS + staging pod hasłem; model treści w Payload; layout, nagłówek, menu, stopka, tokeny kolorów z logo |
| 2 | Strona główna, aktualności/wydarzenia, sekcje; panel: dashboard, etykiety, live preview |
| 3 | Strony tematyczne + bloki, galeria, dokumenty, kontakt, cookies, SEO, tryb kontrastowy/rozmiar tekstu |
| 4 | Testy a11y, poprawki, **udostępnienie wersji testowej GOK** (→ faktura 40%), start wprowadzania treści |
| 4–5 | Do 3 tur poprawek; GOK wprowadza treści |
| 6 | Audyt WCAG, deklaracja, uruchomienie prod, kopie i monitoring, szkolenie (≤ 2 h) + instrukcja PDF, odbiór (→ faktura 60%) |

## 17. Szkolenie i instrukcja

Instrukcja PDF (~10–15 stron, ze zrzutami ekranu) pisana w Markdown w `docs/instrukcja-redaktora/` i eksportowana do PDF: logowanie, dodanie aktualności, dodanie wydarzenia z plakatem, banery, sekcja na nowy sezon (wrzesień), strona z podstronami, galeria, dokument, menu, jak pisać teksty alternatywne, czego unikać (dostępność PDF-ów, zgody na wizerunek). Szkolenie na wersji testowej z prawdziwymi treściami.

## 18. Ryzyka

| Ryzyko | Mitygacja |
|---|---|
| Opóźnione materiały (logo, treści, dostęp do domeny) | lista materiałów w mailu podsumowującym; staging na domenie Kamila; termin liczony od materiałów (w ofercie) |
| Nauka Reacta spowalnia tydzień 1–2 | mało komponentów klienckich; Payload daje gotowy panel; wzorce z oficjalnego szablonu Payload „website” jako punkt odniesienia |
| Zmiany wymagające poprawek w nowych wersjach Payload/Next | przypięte wersje, aktualizacje tylko przez staging, w ramach opieki |
| Zmiana DNS psuje pocztę | zrzut rekordów, zmiana tylko A/AAAA, koordynacja z Tomkiem Adlerem, test poczty po starcie |
| Pastelowa paleta nie przechodzi kontrastu | pastele tylko jako tła, walidacja palety przed prezentacją |
| Niekończące się poprawki | 3 tury z oferty; jedna osoba decyzyjna po stronie GOK **[do GOK]** |

## 19. Otwarte kwestie

**Do GOK:**
1. Logo w wektorze (SVG/PDF/AI).
2. Dokładna domena strony i kto ma dostęp do DNS (Tomek Adler) – oraz czy jest obecna stara strona (przekierowania).
3. Kto zakłada i opłaca konto VPS (sugestia: GOK, dostęp techniczny dla wykonawcy) – czy gmina ma własny serwer.
4. Kto akceptuje wygląd i poprawki (jedna osoba decyzyjna).
5. Lista sekcji, teksty O nas / Kontakt / Dni Kapusty / Pary Królewskie / Hala, zdjęcia, dokumenty, polityka prywatności (IOD).
6. Telefon(y) do zapisów i godziny otwarcia.

**Pozostawione wykonawcy (decyzje w trakcie):** dokładne wersje pakietów, wybór biblioteki lightboxa (z warunkiem dostępności), finalny krój nagłówków, szczegóły tokenów kolorów, nazewnictwo komponentów, konfiguracja Renovate, wybór dostawcy kopii zapasowych i SMTP.
