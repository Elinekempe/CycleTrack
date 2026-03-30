import { loadDefaults } from "./data.js";
import { state, setDefaults, setData, loadStorage, normalizeData, saveStorage, el } from "./state.js";
import { renderCalendar } from "./calendar.js";
import { renderInputs, selectDate, saveEntry, deleteEntry } from "./entry.js";
import { bindFilters } from "./filters.js";
import { renderPrediction, renderStats } from "./stats.js";
import { applyPrivacy, togglePrivacy } from "./privacy.js";

// Rendert alle hoofdonderdelen opnieuw op basis van de huidige state.
function rerenderAll() {
  el("appName").textContent = state.data.config.appName;
  renderInputs();
  renderCalendar();
  renderPrediction();
  renderStats();
  applyPrivacy();
}

// koppelt de noppen voor het invoerscherm aan hun functies
function bindEntryActions() {
  // opslaan 
  el("saveEntry").onclick = (e) => {
    e.preventDefault();
    saveEntry();
  };
// verwijderen 
  el("deleteEntry").onclick = (e) => {
    e.preventDefault();
    deleteEntry();
  };

  // intensiteit slider: update label tijdens input
  el("intensity").oninput = (e) => {
    el("intensityLabel").textContent = `${e.target.value}/10`;
  };
}

// Koppelt kalenderknoppen: vorige/volgende maand, vandaag en reset selectie.
function bindCalendarNavigation() {
  // navigeer naar vorige maand, update kalender
  el("btnPrev").onclick = () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
  };
// navigeer naar volgende maand, update kalender
  el("btnNext").onclick = () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
  };
// navigeer naar vandaag, update kalender en selecteer vandaag
  el("btnToday").onclick = () => {
    state.currentDate = new Date();
    const today = new Date().toISOString().slice(0, 10);
    selectDate(today);
  };
// reset selectie, update kalender
  el("btnReset").onclick = () => {
    state.selectedDate = null;
    el("selectedDate").textContent = "Klik een dag in de kalender";
    renderCalendar();
  };
}

// Privacyknop: zet privacy aan/uit en slaat die keuze direct op.
function bindPrivacy() {
  el("btnPrivacy").onclick = () => {
    togglePrivacy();
    saveStorage(state.data.config.storageKey, state.data);
  };
}

// Centrale plek waar alle eventbindings worden geactiveerd.
function bindEvents() {
  bindEntryActions();
  bindCalendarNavigation();
  bindPrivacy();
  bindFilters();
}

// Opstartflow: defaults laden, storage lezen, state zetten, UI renderen en events koppelen.
async function init() {
  try {
    const defaults = normalizeData(await loadDefaults());
    setDefaults(defaults);
    const stored = loadStorage(state.defaults.config.storageKey);
    const data = stored || state.defaults;
    setData(data);
    rerenderAll();
    bindEvents();
  } catch (err) {
    console.error("❌ Fout bij laden:", err);
  }
}
init();