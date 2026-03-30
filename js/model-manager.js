import { el, state } from "./state.js";

// Stijl- en labelconfiguratie per intercourse-keuze.
const INTERCOURSE_STYLES = {
  with_protection: {
    classes: ["from-blue-200", "to-cyan-200", "border-blue-500", "text-blue-800"],
    label: "💑 Gemeenschap (🛡️)"
  },
  without_protection: {
    classes: ["from-orange-200", "to-red-200", "border-orange-500", "text-orange-800"],
    label: "💑 Gemeenschap (⚠️)"
  }
};

// Alle mogelijke actieve styleclasses op de intercourse-knop.
const INTERCOURSE_ACTIVE_CLASSES = [
  "bg-gradient-to-r",
  "from-blue-200",
  "to-cyan-200",
  "border-blue-500",
  "text-blue-800",
  "from-orange-200",
  "to-red-200",
  "border-orange-500",
  "text-orange-800"
];

// Zet intercourse-knop terug naar neutrale standaardweergave.
function resetIntercourseButton(btn) {
  btn.classList.remove(...INTERCOURSE_ACTIVE_CLASSES);
  btn.classList.add("border-slate-200", "bg-white/80", "text-slate-700");
  btn.textContent = "💑 Gemeenschap";
}

/**
 * Initialiseer alle modal event listeners
 */
export function initModals() {
  // Keuze: met bescherming.
  el("interceptWithProtection").onclick = () => {
    state.selectedIntercourse = "with_protection";
    updateIntercourseDisplay();
    hideIntercourseModal();
  };

  // Keuze: zonder bescherming.
  el("interceptWithoutProtection").onclick = () => {
    state.selectedIntercourse = "without_protection";
    updateIntercourseDisplay();
    hideIntercourseModal();
  };

  // Sluiten zonder keuze te wijzigen.
  el("interceptCancel").onclick = hideIntercourseModal;
}

/**
 * Toon intercourse modal
 */
export function showIntercourseModal() {
  el("intercourseModal").classList.remove("hidden");
}

/**
 * Verberg intercourse modal
 */
export function hideIntercourseModal() {
  el("intercourseModal").classList.add("hidden");
}

/**
 * Update knopstijl en label op basis van geselecteerde intercourse-status.
 */
export function updateIntercourseDisplay() {
  const btn = el("switchIntercourse");
  const config = INTERCOURSE_STYLES[state.selectedIntercourse];

  // Geen geldige keuze: toon standaardknop.
  if (!config) {
    resetIntercourseButton(btn);
    return;
  }

  // Eerst resetten, daarna stijl van gekozen optie toepassen.
  resetIntercourseButton(btn);
  btn.classList.remove("border-slate-200", "bg-white/80", "text-slate-700");
  btn.classList.add("bg-gradient-to-r", ...config.classes);
  btn.textContent = config.label;
}
