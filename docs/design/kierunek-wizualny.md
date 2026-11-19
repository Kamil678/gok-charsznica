# Kierunek wizualny — GOK Charsznica

**Wersja:** 0.1 (2026-11-19) · **Status:** robocza — do korekty po otrzymaniu logo w wektorze
**Zasada nadrzędna:** czytelność dla wszystkich (także seniorów) > efekt. Każdy kolor i rozmiar musi przejść WCAG 2.1 AA.

> Każda zmiana tego pliku: podbij wersję, dopisz wpis w „Historia zmian” na dole.

## 1. Idea: „Ciepły dom kultury z kapuścianym charakterem”

Charsznica to „kapuściana stolica Polski” (Dni Kapusty). Kierunek: **jasno, ciepło, przyjaźnie, nowocześnie** — kremowe tło, stonowane pastele (szałwiowa zieleń liści kapusty, morela, masło, lawenda), głęboka zieleń jako kolor marki, miękkie zaokrąglenia i organiczne, warstwowe kształty przypominające liście (wyłącznie dekoracja).

Nie robimy: urzędowej szarości, „magazynowej” czerni, krzykliwych gradientów, karuzel, efekciarskich animacji, stockowych ilustracji.

Referencje: dk.wolbrom.pl (organizacja treści), Dworek Białoprądnicki (najbliższe wydarzenie na górze, dużo bieli), CK Podgórza (narzędzia dostępności w nagłówku).

## 2. Kolory (tokeny)

Nazwy tokenów = zmienne CSS (`--color-*`) i klasy Tailwind. **Nigdy nie używaj wartości hex bezpośrednio w komponentach.**

| Token | Hex | Rola |
|---|---|---|
| `ink` | `#1F2A24` | tekst główny, nagłówki |
| `ink-muted` | `#4D5A53` | tekst drugorzędny, metadane |
| `bg` | `#FBF8F2` | tło strony (krem) |
| `surface` | `#FFFFFF` | karty, menu rozwijane |
| `primary` | `#2E6A4E` | marka: przyciski, linki, aktywne menu |
| `primary-hover` | `#245640` | hover/active primary |
| `accent` | `#A9472A` | terakota: plakietki dat, wyróżnienia (oszczędnie) |
| `pastel-sage` | `#DDEBDD` | tło sekcji / kart (zieleń) |
| `pastel-apricot` | `#F8E3D4` | tło sekcji / kart (morela) |
| `pastel-butter` | `#F6EDCB` | tło sekcji / kart (masło) |
| `pastel-lavender` | `#E6E6F3` | tło sekcji / kart (lawenda) |
| `border` | `#D9D3C7` | linie dekoracyjne, separatory (nie dla kontrolek) |
| `border-strong` | `#6F776E` | obramowania elementów interaktywnych (≥ 3:1) |
| `focus` | `#1F2A24` | obrys fokusu (3 px, offset 2 px) + biała poświata |

**Zmierzone kontrasty (WCAG):** ink/bg 14.0 · ink-muted/bg 6.8 · ink na każdym pastelu ≥ 11.9 · biały/primary 6.4 · primary/bg 6.0 · primary/pastel-sage 5.2 · accent/bg 5.5 · biały/accent 5.8 · accent/pastel-apricot 4.7 · border-strong/bg 4.4. Wszystkie ≥ 4.5 (tekst) lub ≥ 3 (UI).

**Reguły:**
- Pastele **tylko jako tła**. Tekst na pastelu zawsze `ink` lub `ink-muted`.
- Linki w treści: `primary` + podkreślenie (zawsze — nie tylko kolor).
- `accent` max 1–2 elementy na ekranie (plakietka daty, etykieta „Nowe”).
- Pastele przypisane do typów treści dla spójności: **wydarzenia → apricot**, **sekcje → sage**, **strony tematyczne / Dni Kapusty → butter**, **dokumenty / informacje → lavender**.

### Tryb kontrastowy (`html[data-contrast="high"]`)
| Token | Wartość |
|---|---|
| `bg`, `surface`, pastele | `#000000` |
| `ink`, `ink-muted` | `#FFFFFF` |
| `primary`, `accent`, linki | `#FFE600` (16.6:1 na czarnym) |
| `border`, `border-strong` | `#FFFFFF` |
| przyciski | czarne tło, żółty tekst, żółta ramka 2 px |
Zdjęcia bez zmian; dekoracje organiczne ukryte; cienie wyłączone.

## 3. Typografia

- **Tekst:** Atkinson Hyperlegible Next (zaprojektowany pod czytelność, pełne polskie znaki). **Nagłówki:** Fraunces (ciepły, miękki szeryf; oś SOFT ~50, waga 600). Oba samohostowane przez `next/font`. *Do weryfikacji polskich znaków przy pierwszym renderze; alternatywa nagłówków: Bricolage Grotesque.*
- Bazowy rozmiar **18 px** (`1.125rem`), interlinia 1.6 (tekst), 1.2 (nagłówki), max szerokość akapitu ~68ch.
- Skala (rem, ×1.25): `sm 0.889 · base 1 · lg 1.25 · xl 1.563 · 2xl 1.953 · 3xl 2.441 · 4xl 3.052` (względem 18 px). H1 strony 3xl–4xl, H2 2xl, H3 xl, karty: tytuł lg.
- Rozmiary tekstu A / A+ / A++ = `html { font-size: 100% / 125% / 150% }` — dlatego **wszystko w `rem`**, nic w `px` poza 1-pikselowymi liniami.
- Bez justowania, bez wersalików w dłuższych tekstach (wersaliki tylko krótkie etykiety, z `letter-spacing: 0.04em`).

## 4. Układ i odstępy

- Kontener max **1200 px**, marginesy boczne 16 px (mobile) / 24 px (tablet) / 32 px (desktop).
- Siatka odstępów co 4 px; używane: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Breakpointy: `sm 640 · md 768 · lg 1024 · xl 1280`. Projektujemy **mobile-first**.
- Sekcje strony głównej oddzielone przestrzenią (64–96 px) i zmianą tła (bg ↔ pastel), nie liniami.

## 5. Kształty, cienie, dekoracje

- Zaokrąglenia: przyciski i pola `12px`, karty `20px`, plakietki/pigułki `999px`, zdjęcia w treści `16px`.
- Cień kart: `0 1px 2px rgb(31 42 36 / .06), 0 8px 24px rgb(31 42 36 / .06)`; hover: lekko mocniejszy + `translateY(-2px)` (wyłączone przy `prefers-reduced-motion`).
- **Motyw „liście”:** miękkie, warstwowe kształty SVG (półprzezroczyste pastele) w rogach banerów i nagłówków sekcji — `aria-hidden`, nigdy pod tekstem w sposób obniżający kontrast.
- Ikony: **Lucide** (`lucide-react`), obrys 2 px, rozmiar 20–24 px, zawsze z widocznym tekstem obok lub `aria-label`.

## 6. Kluczowe komponenty (wzorce)

- **DateBadge:** pionowa plakietka: dzień (duży, Fraunces), miesiąc skrótem (`GRU`), godzina pod spodem; tło `accent`, tekst biały; `<time datetime>`.
- **EventCard:** plakat (proporcja 3:4, `contain` na rozmytym tle tego obrazu), DateBadge nachodzący na róg, tytuł, miejsce z ikoną; tło karty `surface`; cała karta klikalna (jeden link, tytuł jako tekst linku).
- **NewsCard:** zdjęcie 16:9, kategoria (pigułka), tytuł, lead 2–3 linie, data publikacji.
- **SectionTile:** tło `pastel-sage`, nazwa sekcji, najbliższy termin („wt 17:00”), strzałka.
- **Banner (strona główna):** 1 duży (zdjęcie/plakat + tytuł + przycisk) + 2 mniejsze kafle; tekst nigdy bezpośrednio na zdjęciu bez nakładki zapewniającej ≥ 4.5:1 — preferowany układ tekst obok/pod obrazem.
- **Przyciski:** primary (wypełniony `primary`, biały tekst), secondary (obrys `border-strong`, tekst `ink`), min. wysokość 48 px, padding 12×20.
- **A11yToolbar:** cienki pasek nad nagłówkiem, tło `surface`, przyciski A / A+ / A++ (`aria-pressed`), „Kontrast” (`aria-pressed`), ikony FB/YT/BIP, telefon `tel:`.
- **Header:** logo lewo, menu prawo (desktop); mobile: przycisk „Menu” z ikoną prawy górny róg → panel pełnoekranowy.

## 7. Zdjęcia i grafiki

- Zdjęcia z wydarzeń: naturalne, bez filtrów; rozmiary kart wg proporcji powyżej.
- Plakaty nigdy nie przycinane. Treść plakatu zawsze powtórzona tekstem we wpisie.
- Placeholder, gdy brak zdjęcia: pastel typu treści + motyw liści + ikona.

## 8. Ruch

Tylko mikrointerakcje 150–200 ms (`ease-out`): hover kart, rozwijanie menu/akordeonów. Brak parallaxu, autoplay i animacji wejścia. Wszystko wyłączone przy `prefers-reduced-motion: reduce`.

## 9. Do potwierdzenia / otwarte

- [ ] Logo w wektorze → dopasowanie `primary` i ewentualnie `accent` do kolorów logo (zachowując kontrasty).
- [ ] Prezentacja 2 alternatywnych palet na wersji testowej (przełącznik tylko na staging): **A „Kapusta”** (powyżej) · **B „Lawenda”** (primary `#4B4A8C`, accent `#A9472A`) · **C „Dojrzałe zboże”** (primary `#7A4E12`) — kontrasty B/C do zmierzenia przed wdrożeniem.
- [ ] Weryfikacja fontów z polskimi znakami.

## Historia zmian
- 0.1 (2026-11-19) — pierwsza wersja kierunku wizualnego (bez logo).
