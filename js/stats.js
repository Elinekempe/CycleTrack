import { state, el } from "./state.js";
import { getCycleMetrics } from "./cycle-utils.js";


export function renderPrediction() {
  // Meest recente cyclus als fallbackbron.
  const cycles = [...state.data.cycles].sort((a, b) => new Date(a.start) - new Date(b.start));
  const c = cycles[cycles.length - 1];

  // Zonder data nog geen voorspelling mogelijk.
  if (!c && state.data.entries.length === 0) {
    el("prediction").innerHTML = '<p class="text-slate-500 italic">Voeg cyclusgegevens in...</p>';
    return;
  }

  const { periodEntries, avgLength, avgPeriodLength, ovulationDay, lastPeriodStart } = getCycleMetrics(state.data.entries, c);

  if (periodEntries.length < 1 && !c) {
    el("prediction").innerHTML = '<p class="text-slate-500 italic">Voeg minstens één menstruatiedag toe...</p>';
    return;
  }

  // Start vanuit laatste cyclusstart, of laatste gelogde periodedag.
  let actualLastPeriodStart = new Date(c.start);
  if (periodEntries.length > 0) {
    actualLastPeriodStart = lastPeriodStart;
  }

  // Bereken volgende menstruatievenster.
  const nextStart = new Date(actualLastPeriodStart);
  nextStart.setDate(nextStart.getDate() + avgLength);

  const nextEnd = new Date(nextStart);
  nextEnd.setDate(nextEnd.getDate() + avgPeriodLength - 1);

  const ovu = new Date(actualLastPeriodStart);
  ovu.setDate(ovu.getDate() + ovulationDay);

  // Korte toelichting onder de voorspelling.
  let cycleInfo = `Gebaseerd op standaard cyclus (${avgLength} dagen)`;
  if (periodEntries.length >= 2) {
    cycleInfo = `Gebaseerd op ${periodEntries.length} menstruaties (gemiddeld: ${avgLength} dagen cyclus, ${avgPeriodLength} dagen menstruatie)`;
  }

  el("prediction").innerHTML = `
    <div class="flex items-center gap-2"><span class="text-xl">🔴</span> <strong>Volgende menstruatie:</strong> ${nextStart.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })} - ${nextEnd.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</div>
    <div class="flex items-center gap-2"><span class="text-xl">🟡</span> <strong>Ovulatie:</strong> ${ovu.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}</div>
    <p class="text-xs text-slate-500 mt-2">${cycleInfo}</p>
    <p class="text-xs text-slate-500">Laatste menstruatie: ${actualLastPeriodStart.toLocaleDateString("nl-NL")}</p>
  `;
}

/**
 * Rendert alleen de gemiddelde intensiteit.
 */
export function renderStats() {
  const entries = state.data.entries || [];

  // Verzamel alleen geldige intensiteitsscores (> 0).
  let intensitySum = 0;
  let intensityCount = 0;

  entries.forEach((entry) => {
    if (typeof entry.intensity === "number" && entry.intensity > 0) {
      intensitySum += entry.intensity;
      intensityCount += 1;
    }
  });

  let averageIntensity = null;
  if (intensityCount) {
    averageIntensity = (intensitySum / intensityCount).toFixed(1);
  }

  // Geen entries: toon lege state.
  if (!entries.length) {
    el("stats").innerHTML = '<p class="text-slate-500 italic">Voeg entries toe om statistieken te zien...</p>';
    return;
  }

  // Fallbacktekst wanneer er nog geen intensiteit is ingevuld.
  let intensityHTML = '<span class="text-xs text-slate-500 italic">Nog geen intensiteit gelogd</span>';
  if (averageIntensity) {
    intensityHTML = `<span class="px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 text-xs font-medium">${averageIntensity}/10</span>`;
  }

  el("stats").innerHTML = `
    <div>
      <p class="text-xs font-semibold text-slate-700 mb-1">Gemiddelde intensiteit</p>
      <div class="flex flex-wrap gap-2">${intensityHTML}</div>
    </div>
  `;
}