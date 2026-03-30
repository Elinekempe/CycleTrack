import { state, el, getEntry, saveStorage } from "./state.js";
import { renderCalendar } from "./calendar.js";
import { renderStats } from "./stats.js";
import { renderSymptomButtons, renderMoodButtons, renderTagButtons, collectSelectedSymptoms, collectSelectedMood, collectSelectedTags, updateButtonStates, resetAllButtons } from "./button-renderer.js";
import { initSwitches, loadSwitchStates, isPeriodActive, getIntercourse } from "./switches.js";
import { initModals } from "./model-manager.js";
import { showToast } from "./ui-utils.js";
import { debug } from "./logger.js";

const EMPTY_NOTE = "";
const NO_INTENSITY_LABEL = "-";
const RESET_SELECTED_TEXT = "Klik een dag in de kalender";

// check of waarde bestaat (niet undefined of null)
function hasValue(value) {
  return value !== undefined && value !== null;
}

// maak nieuwe array van entries zonder de entry met opgegeven datum. 
function withoutDate(entries, dateStr) {
  const remainingEntries = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.date !== dateStr) {
      remainingEntries.push(entry);
    }
  }
  return remainingEntries;
}

function getEntryIntensity(entry) {
  if (entry && hasValue(entry.intensity)) {
    return entry.intensity; 
  }

  // standaard 0 als er geen intensity is opgeslagen
  return 0;
}

function getEntryNote(entry) {
  if (entry && hasValue(entry.note)) {
    return entry.note;
  }

  // fallback naar lege notitie
  return EMPTY_NOTE;
}

// Zet intensity slider + label in één keer goed.
function setIntensityUI(value) {
  el("intensity").value = value;

  // Toon score bij waarde > 0, anders een streepje.
  if (value > 0) {
    el("intensityLabel").textContent = `${value}/10`;
  } else {
    el("intensityLabel").textContent = NO_INTENSITY_LABEL;
  }
}

// Bouwt de datumtekst voor boven het formulier.
function buildSelectedDateLabel(dateStr, isNewEntry) {
  const selectedDate = new Date(dateStr);
  const today = new Date().toISOString().slice(0, 10);
  const isToday = dateStr === today;
  const dayLabel = selectedDate.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  let editLabel = dayLabel;
  if (isToday) {
    editLabel += " (Vandaag)";
  } else if (isNewEntry) {
    editLabel += " (Nieuw toevoegen)";
  } else {
    editLabel += " (Bewerking)";
  }

  return { editLabel, isToday };
}

/**
 * Controleert of er een datum is geselecteerd
 */
function requireSelectedDate({ withAlert = false } = {}) {
  if (state.selectedDate) return true;
  console.warn("⚠️ Geen dag geselecteerd");
  if (withAlert) alert("Selecteer eerst een dag in de kalender");
  return false;
}

/**
 * Bouwt een entry-object op basis van de huidige formulierwaarden
 */
function buildEntryFromForm() {
  return {
    date: state.selectedDate,

    // Huidige keuzes uit de knopgroepen ophalen.
    symptoms: collectSelectedSymptoms(),
    mood: collectSelectedMood(),

    // Lege/ongeldige sliderwaarde wordt 0.
    intensity: parseInt(el("intensity").value) || 0,
    note: el("note").value.trim(),
    tags: collectSelectedTags(),

    // Status uit switches lezen.
    isPeriod: isPeriodActive(),
    intercourse: getIntercourse()
  };
}

/**
 * Voegt een entry toe of update een bestaande entry
 */
function upsertEntry(entry) {
  // Eerst oude versie van dezelfde datum verwijderen.
  const updatedEntries = withoutDate(state.data.entries, entry.date);

  // Daarna nieuwe/gewijzigde entry toevoegen.
  updatedEntries.push(entry);
  state.data.entries = updatedEntries;
}

/**
 * Verwijdert een entry op basis van datum
 */
function removeEntryByDate(dateStr) {
  const beforeCount = state.data.entries.length;
  state.data.entries = withoutDate(state.data.entries, dateStr);

  // True als er daadwerkelijk iets verwijderd is.
  return beforeCount !== state.data.entries.length;
}

/**
 * Slaat data op in localStorage met foutafhandeling
 */
function persistData(errorMessage) {
  try {
    // Centrale opslag in localStorage.
    saveStorage(state.data.config.storageKey, state.data);
    return true;
  } catch (err) {
    console.error("❌ Fout bij opslaan in localStorage:", err);
    showToast(errorMessage, "error");
    return false;
  }
}

/**
 * Herlaadt de statistieken en kalender
 */
function rerenderOverview() {
  // Eerst statistieken, dan kalender met nieuwe data.
  renderStats();
  renderCalendar();
}

/**
 * Reset het volledige entry-formulier naar beginstatus
 */
function resetEntryForm() {
  // Datumselectie loskoppelen van het formulier.
  state.selectedDate = null;
  el("selectedDate").textContent = RESET_SELECTED_TEXT;

  // Alle invoervelden terug naar standaard.
  el("intensity").value = 0;
  el("intensityLabel").textContent = NO_INTENSITY_LABEL;
  el("note").value = EMPTY_NOTE;
  resetAllButtons();
}

/**
 * Rendert alle invoerknoppen en initialiseert switch/modal gedrag.
 */
export function renderInputs() {
  // Initialiseer alle keuzeknoppen op basis van catalogusdata.
  renderSymptomButtons(state.data.catalog.symptoms, el("filterSymptom"));
  renderMoodButtons(state.data.catalog.moods, el("filterMood"));
  renderTagButtons(state.data.catalog.tags);
  
  // Koppel switch- en modalgedrag aan de UI.
  initSwitches();
  initModals();
}

/**
 * Selecteer dag + laad/reset form
 * Ondersteunt huidige dag, vorige dagen MET data, EN vorige dagen ZONDER data
 */
export function selectDate(dateStr) {
  // Geselecteerde dag centraal opslaan.
  state.selectedDate = dateStr;
  const entry = getEntry(dateStr);
  const isNew = !entry;

  const { editLabel, isToday } = buildSelectedDateLabel(dateStr, isNew);
  
  el("selectedDate").textContent = editLabel;
  debug("📅 Dag geselecteerd:", dateStr, "Vandaag:", isToday, "Nieuw:", isNew, "Entry gevonden:", !!entry);

  const intensityValue = getEntryIntensity(entry);
  setIntensityUI(intensityValue);

  // Bestaande notitie laden of leeg starten.
  el("note").value = getEntryNote(entry);

  // Knoppen en switches synchroniseren met entrydata.
  updateButtonStates(entry);
  loadSwitchStates(entry);

  // Kalender hertekenen zodat selectie zichtbaar blijft.
  renderCalendar();
}

export function saveEntry() {
  // Zonder dagselectie niets opslaan.
  if (!requireSelectedDate({ withAlert: true })) return;

  const entry = buildEntryFromForm();
  upsertEntry(entry);
  if (!persistData("❌ Fout bij opslaan!")) return;

  showToast("✓ Wijzigingen opgeslagen!", "success");
  rerenderOverview();
  debug("✓ Entry volledig opgeslagen en UI bijgewerkt!");
}

export function deleteEntry() {
  // Zonder dagselectie niets verwijderen.
  if (!requireSelectedDate()) return;

  const entry = getEntry(state.selectedDate);
  if (!entry) {
    console.warn("⚠️ Geen gegevens om te verwijderen");
    showToast("Geen gegevens om te verwijderen", "error");
    return;
  }

  const confirmed = confirm(`Weet je zeker dat je alle gegevens van ${state.selectedDate} wilt verwijderen?\n\nDit kan niet ongedaan gemaakt worden.`);
  if (!confirmed) {
    debug("🔹 Verwijdering geannuleerd");
    return;
  }

  debug("🗑️ Entry aan het verwijderen voor:", state.selectedDate);

  const removed = removeEntryByDate(state.selectedDate);
  
  // Extra veiligheidscheck voor onverwachte state.
  if (!removed) {
    console.warn("⚠️ Entry niet gevonden om te verwijderen");
    showToast("Entry niet gevonden", "error");
    return;
  }

  debug("  ✓ Entry verwijderd (totaal:", state.data.entries.length, ")");

  if (!persistData("❌ Fout bij verwijderen!")) return;

  showToast("✓ Gegevens verwijderd!", "success");

  resetEntryForm();
  rerenderOverview();
  debug("✓ Entry volledig verwijderd en UI bijgewerkt!");
}