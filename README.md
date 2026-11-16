# FORMA · Body Progress Lab

Offline-first česká webová aplikace pro evidenci ranní váhy, InBody, cílů a výživy. Bez externích JS knihoven, přizpůsobená počítači i telefonu.

## Soukromí

**Repozitář obsahuje jen kód a prázdná počáteční data. Neobsahuje žádná reálná vážení, InBody ani jídelníčky.** Vlastní údaje naimportuj v aplikaci přes **Data a zálohy → Importovat JSON**. Zálohy nikdy necommituj ani nevkládej do GitHub Issues / PR.

Data se ukládají pouze do `localStorage` konkrétního prohlížeče a domény (klíč `forma.bodylab.v1`), ne do GitHubu. Před změnou zařízení nebo mazáním dat prohlížeče exportuj zálohu. Bez přihlášení a cloudové synchronizace se data automaticky nepřenášejí.

## Lokální spuštění

```bash
python3 build.py
python3 -m http.server 8080
```

Otevři http://localhost:8080. `standalone.html` lze otevřít i jako lokální HTML, ale ukládání z `file://` nemusí být spolehlivé.

## Vývoj a testy

```bash
node tests/test_math.js
python3 build.py
git diff --exit-code -- index.html standalone.html
```

CI na PR kontroluje syntax JS, jednotkové testy a reprodukovatelnost vygenerovaného HTML.

## Struktura

- `src/seed.js`: katalog měřených parametrů a **prázdná** nová instalace.
- `src/math.js`: výpočty, validace, import a export.
- `src/app.js`: UI a obsluha formulářů.
- `src/styles.css`: vizuální styl a responzivita.
- `src/index.template.html`: zdrojová HTML šablona.
- `build.py`: generuje `index.html` (web/PWA) a `standalone.html`.
- `manifest.webmanifest`, `sw.js`, `assets/icon.svg`: offline podpora.
- `docs/ROADMAP.md`, `SECURITY.md`, `tests/`: plán, bezpečnost, testy.

## Pravidla spolupráce

Stabilní větev: `buuk`. Nové funkce ve vlastních větvích a přes **Draft PR**; merguje pouze vlastník. U změn schématu dat řeš kompatibilitu se zálohami `version: 1`, migraci a návratovou cestu.

### Důležitá omezení

Neobsahuje účet, cloudovou synchronizaci, WHOOP napojení ani zdravotnické vyhodnocení. Pro veřejný hosting nenasazuj soukromé exporty; i veřejný statický kód webu je viditelný každému.

## Záchrana nečitelných dat

Při nekompatibilní verzi zálohy nebo poškozeném záznamu v `localStorage` aplikace chrání původní obsah před přepsáním. Nabízí stažení původního JSON, obnovu zálohy a vědomý reset (dvě potvrzení). Import a reset jsou potvrzené až po skutečně úspěšném zápisu. Nedostatek místa v prohlížeči nezobrazuje falešný úspěch.

28denní trend vyžaduje nejméně 8 měření v rozmezí minimálně 14 dnů.
