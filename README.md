# CycleTrack

CycleTrack is een website om je cyclus en klachten per dag bij te houden.

## Wat kun je hiermee?

Met deze website kun je per dag opslaan:
- symptomen
- mood
- tags
- intensiteit
- notities
- menstruatie
- gemeenschap

Je ziet alles terug in een kalender, plus een simpele voorspelling en statistiek.

## Belangrijkste functies

- Kalender met kleuren voor fase van je cyclus
- Daginvoer met knoppen en slider
- Filters op symptoom en mood
- Voorspelling van volgende menstruatie en ovulatie
- Privacymodus (vervaagt gevoelige informatie)

## Snel starten

1. Clone de repository:

```bash
git clone https://github.com/Elinekempe/CycleTrack
cd CycleTrack
```

2. Open de map in VS Code.
3. Open `index.html` met Live Server.
4. De website draait nu lokaal.

## Eerste keer gebruiken

1. Klik een dag in de kalender.
2. Vul je gegevens in (symptomen, mood, notitie, etc.).
3. Klik op **Opslaan**.
4. Je gegevens blijven bewaard in je browser.

## Kleuren in de kalender

- Roze: menstruatiefase
- Geel: ovulatie
- Groen: vruchtbare dagen
- Blauwe ring: vandaag
- Donkere stip: er staat data op die dag

## Filters gebruiken

- Kies boven de kalender een symptoom of mood.
- Dagen zonder match worden lichter gemaakt.
- Zet het filter terug op leeg om alles weer normaal te zien.

## Bestanden (kort)

- `index.html` – de pagina zelf (layout en knoppen)
- `data.json` – standaardinstellingen (symptomen, moods, tags, startcyclus)
- `js/app.js` – start de website op en koppelt knoppen aan functies
- `js/state.js` – bewaart de data en regelt opslaan/laden
- `js/data.js` – leest `data.json` in
- `js/calendar.js` – tekent de kalender en kleurt dagen per cyclusfase
- `js/entry.js` – invullen, opslaan en verwijderen van daggegevens
- `js/button-renderer.js` – maakt symptoom/mood/tag-knoppen en leest selecties uit
- `js/switches.js` – regelt de menstruatie- en gemeenschap-schakelaars
- `js/model-manager.js` – regelt het keuzescherm (modal) voor gemeenschap
- `js/filters.js` – filtert kalenderdagen op symptoom en mood
- `js/stats.js` – toont voorspelling en gemiddelde intensiteit
- `js/privacy.js` – zet privacymodus aan/uit
- `js/ui-utils.js` – kleine hulpfuncties voor knoppen en meldingen
- `js/cycle-utils.js` – berekent cycluslengte, menstruatieduur en ovulatie
- `js/logger.js` – debug logs voor tijdens bouwen/testen

## Data en privacy

- Gegevens worden lokaal opgeslagen in je browser.
- Privacyknop bovenin vervaagt gevoelige informatie op het scherm.
- Er is geen account of online opslag, dus alleen jij hebt toegang tot je data.


## Toekomstige functies

- Exporteren van data
- Grafieken van symptomen en mood
- Eigen account
