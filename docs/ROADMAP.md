# FORMA · roadmap

## Společná pravidla
- Stabilní větev `buuk`; samostatné `feat/...` větve a **Draft PR**.
- Merguje pouze vlastník po kontrole.
- Reálné osobní záznamy nikdy do GitHubu.
- U změny datového modelu vždy migrace, záloha a test zpětné kompatibility.
- Každé PR obsahuje rozsah, testy, rizika a dopady na existující data.

## M0 · Funkční základ
- Ranní váha: přidávání, úpravy, mazání, CSV, grafy a trend.
- InBody: komplexní metriky a segmenty, chybějící měření jako `null`.
- Cíle, stravovací záznamy, lokální JSON zálohy a přehledy.
- Responsivní web/PWA, základní automatické testy.

## M1 · Spolehlivost
- Browser E2E testy v GitHub Actions.
- Přísnější validace a schéma pro import a export.
- Datové migrace a historie úprav.
- Přístupnost, PWA offline test a audit na telefonu.
- Trendy váhy za 7/14/28 dní a intervaly nejistoty.

## M2 · Trénink a výkonnost
- Tréninkový deník: cviky, série, váhy, RIR/RPE, osobní rekordy.
- MMA, squash, kondice, regenerace.
- Obvody těla a soukromé fotky.
- Propojení jídelníčku a tréninku bez neodůvodněných kauzálních závěrů.

## M3 · Bezpečná synchronizace
- HTTPS hosting, přihlášení, šifrované úložiště a správa přístupu.
- Explicitně odsouhlasené integrace (např. WHOOP dle dostupného API).
- Export osobních dat a smazání účtu.

## M4 · Individuální analytika
- Adaptivní kalorické cíle podle dlouhodobých trendů.
- Rozlišení měření od dopočtených hodnot a nejistot InBody.
- Dlouhodobé cíle bez nepravdivě přesných termínů.
