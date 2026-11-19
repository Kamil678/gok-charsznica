# Mapa planów — GOK Charsznica

Spec: `docs/specs/2026-11-19-gok-strona-design.md` · Wygląd: `docs/design/kierunek-wizualny.md`

Każdy plan kończy się działającym, testowalnym oprogramowaniem. Szczegółowy plan piszemy dopiero, gdy poprzedni jest zrobiony (żeby opierał się na realnym kodzie). Przy każdej zmianie zakresu aktualizuj ten plik.

| # | Plan | Zakres (sekcje specu) | Tydz. | Status |
|---|---|---|---|---|
| 1 | **Fundament** — `2026-11-19-plan-1-fundament.md` | repo, Next+Payload, narzędzia, tokeny + fonty, globals Dane GOK i Menu (typy: lista / ścieżka / zewnętrzny), szkielet strony (skip link, pasek dostępności, nagłówek, menu desktop/mobile, stopka), obraz Docker, CI, staging pod hasłem (§5, 5a, 8 nagłówek, 9 rozmiar/kontrast, 12 częściowo, 13 staging) | 1 | zaplanowany |
| 2 | **Treści w panelu** | `slugifyPl` + pole slug, media (alt wymagany, rozmiary), categories, posts (+ wydarzenie, „nadchodzące”), sections, pages (nested-docs, bloki), galleries, documents, global homepage (banery z `showUntil`), Menu: typy „strona” i „sekcja”, dashboard redaktora, grupy panelu, live preview, szkice/wersje, revalidacja kolekcji, seed treści demo (§6, 12) | 1–2 | — |
| 3 | **Szablony strony** | strona główna, /aktualnosci (filtr, paginacja), /wydarzenia (nadchodzące/minione), wpis, /sekcje + sekcja, strony [...slug] z renderem bloków, /galeria + lightbox, /do-pobrania, /kontakt, mapa/YouTube po kliknięciu, placeholdery, przełącznik palet A/B/C tylko na staging (§7, 8, kierunek wizualny §6–9) | 2–3 | — |
| 4 | **Prywatność, SEO, audyt dostępności** | baner cookies, polityka/deklaracja dostępności (pola w Dane GOK), mapa strony, plugin SEO, metadata/OG, sitemap/robots, JSON-LD Organization/Event, axe na wszystkich szablonach, Lighthouse CI ≥ 95, test ręczny (§9, 10, 11) | 3–4 | — |
| 5 | **Produkcja i przekazanie** | stos prod na VPS, kopie restic + test odtworzenia, monitoring + Sentry, SMTP resetu hasła, procedura DNS + checklista startu, kopia staging→prod, przekierowania, Renovate, instrukcja redaktora PDF (§13, 17) | 5–6 | — |

## Historia zmian
- 2026-11-19 — pierwsza wersja mapy planów.
- 2026-11-20 — dokumenty przeniesione do `docs/specs` i `docs/plany`; gałąź robocza `develop` (PR do `main`); pnpm 10.x przypięty przez corepack.
