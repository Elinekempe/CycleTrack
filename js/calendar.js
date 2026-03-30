import { state, el, getEntry } from "./state.js";
import { getCycleMetrics } from "./cycle-utils.js";
import { debug } from "./logger.js";

// Bepaalt voor één datum in welke cyclusfase die valt.
export function getCyclePhase(dateStr, cycles) {
  const d = new Date(dateStr);
  
  const { periodEntries, periodGroups, avgLength, avgPeriodLength, ovulationDay, lastPeriodStart } = getCycleMetrics(
    state.data.entries,
    cycles[0]
  );
  
  // Gebruik berekende periodedata als die beschikbaar is.
  if (periodEntries.length > 0) {
    const periodLengths = [];
    for (let i = 0; i < periodGroups.length; i++) {
      periodLengths.push(periodGroups[i].length);
    }
    debug(`Berekende menstruatie-lengte: ${avgPeriodLength} dagen (groepen: ${periodLengths.join(", ")})`);
    
    // Loop door alle periodestarts en bepaal de fase binnen die cyclus.
    for (let i = 0; i < periodGroups.length; i++) {
      const cycleStart = new Date(periodGroups[i][0].date);
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setDate(cycleEnd.getDate() + avgLength - 1);
      
      // Controleer of datum binnen deze cyclus valt.
      if (d >= cycleStart && d <= cycleEnd) {
        const dayInCycle = Math.floor((d - cycleStart) / 86400000);
        
        // Bepaal fase op basis van dagpositie in de cyclus.
        if (dayInCycle < avgPeriodLength) return "period";
        if (dayInCycle === ovulationDay) return "ovulation";
        if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) return "fertile";
        return "normal";
      }
    }
    
    // Na laatste bekende periodestart: projecteer fase vooruit met gemiddelde cyclus.
    if (lastPeriodStart && d > lastPeriodStart) {
      const daysSinceLast = Math.floor((d - lastPeriodStart) / 86400000);
      const cycleDay = daysSinceLast % avgLength;

      // Bepaal fase op basis van dagpositie in de projectie.
      if (cycleDay < avgPeriodLength) return "period";
      if (cycleDay === ovulationDay) return "ovulation";
      if (cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 2) return "fertile";
      return "normal";
    }
  }
  
  // Fallback als er geen data is.
  return getCyclePhaseFromDefaults(dateStr, cycles);
}

// Eenvoudige fallbackberekening wanneer er nog weinig of geen logs zijn.
function getCyclePhaseFromDefaults(dateStr, cycles) {
  const d = new Date(dateStr);
  for (const c of cycles) {
    // Bepaal start- en einddatum voor standaardcyclus.
    const start = new Date(c.start);
    const end = new Date(start);
    end.setDate(end.getDate() + c.length - 1);

    // Alleen dagen binnen deze cyclus evalueren.
    if (d >= start && d <= end) {
      const dayIndex = Math.floor((d - start) / 86400000);
      const periodEnd = c.periodLength - 1;
      const ovulationDay = Math.round(c.length / 2);

      // Bepaal fase binnen standaardcyclus.
      if (dayIndex <= periodEnd) return "period";
      if (dayIndex === ovulationDay) return "ovulation";
      if (dayIndex >= ovulationDay - 2 && dayIndex <= ovulationDay + 2) return "fertile";
      return "normal";
    }
  }
  return "normal";
}

// Zet de maandtitel boven de kalender (bijv. "maart 2026").
export function setMonthLabel() {
  const locale = state.data.config.locale || "nl-NL";
  el("monthLabel").textContent = state.currentDate.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

// Bouwt alle kalendercellen opnieuw op voor de huidige maand.
export function renderCalendar() {
  const cal = el("calendar");
  cal.innerHTML = "";
  setMonthLabel();

  // Haal maandgegevens op voor het kalenderrooster.
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  
  // Vandaag gebruiken voor extra visuele highlight.
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Lege cellen voor de startoffset (zodat weekdagen goed uitlijnen).
  for (let i = 0; i < startOffset; i++) cal.appendChild(document.createElement("div"));
  // Loop door alle dagen van de huidige maand.
  for (let day = 1; day <= daysInMonth; day++) {
    // Maak datum + ISO-string voor deze dag.
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().slice(0, 10);

    // Bepaal fase en eventuele bestaande entry.
    const phase = getCyclePhase(dateStr, state.data.cycles);
    const entry = getEntry(dateStr);
    const isToday = dateStr === todayStr;

    // Bouw kalendercel als klikbare knop.
    const cell = document.createElement("button");
    cell.className = "cal-cell rounded-xl p-3 text-sm font-semibold border-2 transition cursor-pointer";
    
    // Achtergrondkleur per cyclusfase.
    if (phase === "period") {
      cell.classList.add("bg-gradient-to-br", "from-rose-300", "to-pink-400", "border-rose-500", "text-white", "shadow-md");
    } else if (phase === "ovulation") {
      cell.classList.add("bg-gradient-to-br", "from-amber-300", "to-yellow-400", "border-amber-500", "text-white", "shadow-md");
    } else if (phase === "fertile") {
      cell.classList.add("bg-gradient-to-br", "from-emerald-200", "to-teal-300", "border-emerald-500", "text-slate-900", "shadow-md");
    } else {
      cell.classList.add("bg-white/70", "border-slate-200", "text-slate-900", "hover:bg-white/90");
    }
    
    // Vandaag: blauwe ring.
    if (isToday) {
      cell.classList.add("ring-2", "ring-blue-500", "ring-offset-2", "ring-offset-white");
    }
    
    // Geselecteerde datum: extra duidelijke highlight.
    if (dateStr === state.selectedDate) {
      cell.classList.add("ring-4", "ring-rose-600", "ring-offset-2", "ring-offset-white", "scale-105", "shadow-lg");
    }
    
    // Symptoomfilter actief en geen match: dag dimmen.
    const hasSymptomFilter = state.filter.symptom !== "";
    const hasEntrySymptoms = entry && entry.symptoms;
    let symptomMatches = false;
    if (hasEntrySymptoms) {
      symptomMatches = entry.symptoms.includes(state.filter.symptom);
    }

    if (hasSymptomFilter && !symptomMatches) {
      cell.classList.add("opacity-40");
    }

    // Moodfilter actief en geen match: dag dimmen.
    const hasMoodFilter = state.filter.mood !== "";
    let moodMatches = false;
    if (entry) {
      moodMatches = entry.mood === state.filter.mood;
    }

    if (hasMoodFilter && !moodMatches) {
      cell.classList.add("opacity-40");
    }

    cell.textContent = day;

    // Puntjes rechtsonder voor fase en/of gelogde data.
    const dotContainer = document.createElement("div");
    dotContainer.style.position = "absolute";
    dotContainer.style.bottom = "4px";
    dotContainer.style.right = "4px";
    dotContainer.style.display = "flex";
    dotContainer.style.gap = "2px";
    dotContainer.style.pointerEvents = "none";
    dotContainer.style.zIndex = "10";
    
    // Voeg fasedot toe op basis van cyclusfase.
    if (phase === "period") {
      const phaseDot = document.createElement("span");
      phaseDot.style.width = "6px";
      phaseDot.style.height = "6px";
      phaseDot.style.borderRadius = "50%";
      phaseDot.style.background = "linear-gradient(135deg, #fb7185, #ec4899)";
      phaseDot.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
      phaseDot.title = "Menstruatie";
      dotContainer.appendChild(phaseDot);
    } else if (phase === "ovulation") {
      const phaseDot = document.createElement("span");
      phaseDot.style.width = "6px";
      phaseDot.style.height = "6px";
      phaseDot.style.borderRadius = "50%";
      phaseDot.style.background = "linear-gradient(135deg, #fbbf24, #eab308)";
      phaseDot.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
      phaseDot.title = "Ovulatie";
      dotContainer.appendChild(phaseDot);
    } else if (phase === "fertile") {
      const phaseDot = document.createElement("span");
      phaseDot.style.width = "6px";
      phaseDot.style.height = "6px";
      phaseDot.style.borderRadius = "50%";
      phaseDot.style.background = "linear-gradient(135deg, #4ade80, #14b8a6)";
      phaseDot.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
      phaseDot.title = "Vruchtbaar";
      dotContainer.appendChild(phaseDot);
    }
    
    // Voeg extra dot toe wanneer er entry-data is.
    if (entry) {
      const entryDot = document.createElement("span");
      entryDot.style.width = "7px";
      entryDot.style.height = "7px";
      entryDot.style.borderRadius = "50%";
      entryDot.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
      
      if (entry.isPeriod) {
        entryDot.style.background = "linear-gradient(135deg, #f43f5e, #be185d)";
        entryDot.style.border = "1px solid #fce7f3";
        entryDot.title = "Menstruatie gelogd";
      } else {
        entryDot.style.background = "#404040";
        entryDot.title = "Gegevens";
      }
      dotContainer.appendChild(entryDot);
    }
    
    // Alleen toevoegen als er minimaal één dot aanwezig is.
    if (dotContainer.children.length > 0) {
      cell.style.position = "relative";
      cell.style.overflow = "visible";
      cell.appendChild(dotContainer);
    }

    // Bij klik: selecteer dag en scroll naar invoerkaart.
    cell.onclick = () => {
      import("./entry.js").then(({ selectDate }) => {
        selectDate(dateStr);
        setTimeout(() => {
          const detailCard = document.querySelector(".glass.rounded-2xl.fade-in.space-y-4");
          if (detailCard) {
            detailCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      });
    };
    // Voeg cel toe aan het kalenderrooster.
    cal.appendChild(cell);
  }
}