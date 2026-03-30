# CycleTrack - Very Serious Business Inc.

De CycleTrack periodetracker-website van Very Serious Business Inc.

## Over dit project

CycleTrack is een client-side app voor menstruatietracking, met focus op dagelijkse logs, visualisatie van cyclusfases en eenvoudige voorspellingen.

Dit project bundelt periodegerelateerde data (symptomen, mood, tags, intensiteit, notities, menstruatie-/gemeenschapsstatus) in één duidelijke interface met kalender en statistieken.

Belangrijkste kenmerken:
- Vanilla JavaScript modules (zonder framework)
- Tailwind-gebaseerde UI met glassmorphism-stijl
- Local-first opslag via `localStorage`
- Standaard startdata uit `data.json`
- Privacymodus om gevoelige info te vervagen

## Snel starten

1. Clone de repository:
   ```bash
   git clone <jouw-repository-url>
   cd period\ tracking\ eline
   ```

2. Start een lokale webserver (aanbevolen voor ES-modules):

   Optie A (Python):
   ```bash
   python3 -m http.server 3000
   ```

   Optie B (Node):
   ```bash
   npx serve .
   ```

3. Open je browser:
   - `http://localhost:3000` (Python)
   - of de URL die `serve` toont

Alternatief:
- Open `index.html` met VS Code Live Server.

## Inhoud

### Frontend

De frontend is gebouwd met HTML, TailwindCSS en modulaire JavaScript-bestanden.

#### Belangrijkste UI-onderdelen
- Kalender (maandnavigatie, dagselectie, cycluskleuren)
- Dagdetail-paneel (symptomen, mood, tags, intensiteit, notitie, switches)
- Voorspellingspaneel (volgende menstruatie + ovulatie-inschatting)
- Statistiekenpaneel (gemiddelde intensiteit)

#### Module-overzicht
- `js/app.js`
  - App-opstart, eventbinding en globale rerender-flow.

- `js/state.js`
  - Centrale state, datanormalisatie, `localStorage` laden/opslaan en entry-opzoeking.

- `js/calendar.js`
  - Kalenderrendering, cyclusfasebepaling, filters en dagcel-interactie.

- `js/entry.js`
  - Dagselectie, formulier vullen, opslaan/verwijderen en formulierreset.

- `js/button-renderer.js`
  - Renderen van symptoom-/mood-/tagknoppen en verzamelen van selecties.

- `js/cycle-utils.js`
  - Berekening van cyclusstatistieken (gem. cycluslengte, menstruatieduur, ovulatiedag).

- `js/stats.js`
  - Rendering van voorspellingen en statistieken.

- `js/switches.js`
  - Gedrag van menstruatie-/gemeenschap-switches en laden van hun state.

- `js/model-manager.js`
  - Beheer van de gemeenschap-modal en knopweergave.

- `js/filters.js`
  - Eventbinding voor symptoom- en moodfilters.

- `js/privacy.js`
  - Privacymodus in- en uitschakelen en toepassen op de UI.

- `js/ui-utils.js`
  - Gedeelde UI-helpers (knopstatusklassen, toastmeldingen).

- `js/logger.js`
  - Debug-logging alleen wanneer ingeschakeld.

- `js/data.js`
  - Laden van standaarddata uit `data.json`.

### Datalaag

- `data.json`
  - Standaardconfiguratie, catalogusopties, fallback-cyclus en basisstructuren.

- `localStorage`-key
  - Persistente appstate onder de ingestelde sleutel (standaard `cycletrack.v1`).

## Handover / ontwikkelnotities

Houd bij verdere ontwikkeling rekening met het volgende:

### Architectuur
- De app draait volledig client-side en heeft momenteel geen backend of authenticatie.
- Datacontracten worden genormaliseerd in `state.normalizeData()` voor oud/nieuw JSON-formaat.
- Veel UI-gedrag hangt af van CSS-klassen (toggleknoppen), dus consistente classnamen zijn belangrijk.

### Opslag & data
- Bestaande gebruikers kunnen al `localStorage`-data hebben; schemawijzigingen moeten backward-compatible blijven.
- Houd `data.json` en de normalisatielogica synchroon bij nieuwe velden.
- De kwaliteit van voorspellingen hangt af van correct gelogde `isPeriod`-waarden.

### Onderhoudbaarheid
- De huidige modulestructuur is prima voor iteratie, maar kan later profiteren van sterkere typing/tests.
- Overweeg gedeelde datumhelpers als de kalender- en voorspelfuncties verder groeien.

## Mogelijke roadmap

- Local-only opslag vervangen door een echte backend-API
- Accountsysteem en synchronisatie tussen apparaten toevoegen
- Export/import (JSON/CSV) en back-upflow toevoegen
- Analyses uitbreiden (cyclusvariatie, symptoomtrends, correlaties)
- Toegankelijkheid en toetsenbordnavigatie verbeteren
- Geautomatiseerde tests toevoegen voor cyclusberekeningen en rendering

## Tech stack

- HTML5
- TailwindCSS (CDN)
- Vanilla JavaScript (ES modules)
- Browser `localStorage`

## Licentie

Er is geen licentie opgegeven in deze repository.
