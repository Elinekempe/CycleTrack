import { state, el } from "./state.js";
import { renderCalendar } from "./calendar.js";

// Koppelt filtervelden aan state en hertekent direct de kalender.
export function bindFilters() {
    // Symptoomfilter aanpassen.
    el("filterSymptom").onchange = (e) => {
        state.filter.symptom = e.target.value;
        renderCalendar();
    };

    // Stemmingsfilter aanpassen.
    el("filterMood").onchange = (e) => {
        state.filter.mood = e.target.value;
        renderCalendar();
    }
}