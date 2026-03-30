import { el } from "./state.js";
import { toggleButton, resetButton, activateButton } from "./ui-utils.js";

// Rendert symptoomknoppen en vult ook het symptoomfilter.
export function renderSymptomButtons(symptoms, filterSelect) {
  const container = el("symptoms");
  container.innerHTML = "";
  filterSelect.innerHTML = '<option value="">Filter symptoom</option>';

  // Maak per symptoom een knop en filteroptie.
  symptoms.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "px-3 py-2 border-2 border-slate-200 rounded-lg text-xs font-medium bg-white/80 hover:bg-white text-slate-700 transition";
    btn.textContent = s;
    btn.dataset.value = s;
    btn.onclick = () => toggleButton(btn, "from-rose-200", "to-pink-200", "border-rose-500", "text-rose-800");
    container.appendChild(btn);

    // Dezelfde waarde ook als filteroptie toevoegen.
    const option = document.createElement("option");
    option.value = s;
    option.textContent = s;
    filterSelect.appendChild(option);
  });
}

// Rendert moodknoppen en vult ook het moodfilter.
export function renderMoodButtons(moods, filterSelect) {
  const container = el("moods");
  container.innerHTML = "";
  filterSelect.innerHTML = '<option value="">Filter mood</option>';

  // Maak per mood een knop en filteroptie.
  moods.forEach((m) => {
    // Bouw moodknop.
    const btn = document.createElement("button");
    btn.className = "px-3 py-2 border-2 border-slate-200 rounded-lg text-lg bg-white/80 hover:bg-white text-slate-700 transition";
    btn.textContent = m;
    btn.dataset.value = m;
    btn.onclick = () => {
      // Eerst alle moods resetten, daarna alleen de geklikte mood activeren.
      [...container.children].forEach((c) => resetButton(c, "amber"));
      activateButton(btn, "from-amber-200", "to-orange-200", "border-amber-500", "text-amber-800");
    };
    // Voeg knop toe aan moodcontainer.
    container.appendChild(btn);

    // Dezelfde waarde ook als filteroptie toevoegen.
    const option = document.createElement("option");
    option.value = m;
    option.textContent = m;
    filterSelect.appendChild(option);
  });
}

// Rendert tagknoppen.
export function renderTagButtons(tags) {
  const container = el("tags");
  container.innerHTML = "";

  // Maak per tag een toggleknop.
  tags.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "px-3 py-2 border-2 border-slate-200 rounded-lg text-xs font-medium bg-white/80 hover:bg-white text-slate-700 transition";
    btn.textContent = t;
    btn.dataset.value = t;
    btn.onclick = () => toggleButton(btn, "from-emerald-200", "to-teal-200", "border-emerald-500", "text-emerald-800");
    container.appendChild(btn);
  });
}

// Geeft alle geselecteerde symptomen terug.
export function collectSelectedSymptoms() {
  const selected = [];
  const buttons = el("symptoms").children;

  // Loop door alle symptoomknoppen.
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];

    // Actieve knop herkennen via styleclass.
    if (button.classList.contains("text-rose-800")) {
      selected.push(button.dataset.value);
    }
  }

  return selected;
}

// Geeft de geselecteerde mood terug (single-select).
export function collectSelectedMood() {
  const buttons = el("moods").children;

  // Loop door alle moodknoppen.
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];

    // Eerste actieve mood direct teruggeven.
    if (button.classList.contains("text-amber-800")) {
      return button.dataset.value;
    }
  }

  return null;
}

// Geeft alle geselecteerde tags terug.
export function collectSelectedTags() {
  const selected = [];
  const buttons = el("tags").children;

  // Loop door alle tagknoppen.
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];

    // Actieve knop herkennen via styleclass.
    if (button.classList.contains("text-emerald-800")) {
      selected.push(button.dataset.value);
    }
  }

  return selected;
}

// Synchroniseert knopstatus met de data van een entry.
export function updateButtonStates(entry) {
  // Symptomen: activeer knoppen die in entry.symptoms staan.
  const symptomButtons = el("symptoms").children;
  for (let i = 0; i < symptomButtons.length; i++) {
    const button = symptomButtons[i];
    let symptoms = [];
    if (entry && entry.symptoms) {
      symptoms = entry.symptoms;
    }
    const active = symptoms.includes(button.dataset.value);

    // Activeer of reset knop op basis van match.
    if (active) {
      activateButton(button, "from-rose-200", "to-pink-200", "border-rose-500", "text-rose-800");
    } else {
      resetButton(button, "rose");
    }
  }

  // Mood: single-select op exacte waarde.
  const moodButtons = el("moods").children;
  for (let i = 0; i < moodButtons.length; i++) {
    const button = moodButtons[i];
    // Mood is single-select: exacte match bepaalt actief/inactief.
    const active = entry && entry.mood === button.dataset.value;

    // Activeer of reset knop op basis van match.
    if (active) {
      activateButton(button, "from-amber-200", "to-orange-200", "border-amber-500", "text-amber-800");
    } else {
      resetButton(button, "amber");
    }
  }

  // Tags: activeer knoppen die in entry.tags staan.
  const tagButtons = el("tags").children;
  for (let i = 0; i < tagButtons.length; i++) {
    const button = tagButtons[i];
    let tags = [];
    if (entry && entry.tags) {
      tags = entry.tags;
    }
    const active = tags.includes(button.dataset.value);

    // Activeer of reset knop op basis van match.
    if (active) {
      activateButton(button, "from-emerald-200", "to-teal-200", "border-emerald-500", "text-emerald-800");
    } else {
      resetButton(button, "emerald");
    }
  }
}

// Reset alle invoerknoppen naar inactief.
export function resetAllButtons() {
  // Reset symptoomknoppen.
  const symptomButtons = el("symptoms").children;
  for (let i = 0; i < symptomButtons.length; i++) {
    resetButton(symptomButtons[i], "rose");
  }

  // Reset moodknoppen.
  const moodButtons = el("moods").children;
  for (let i = 0; i < moodButtons.length; i++) {
    resetButton(moodButtons[i], "amber");
  }

  // Reset tagknoppen.
  const tagButtons = el("tags").children;
  for (let i = 0; i < tagButtons.length; i++) {
    resetButton(tagButtons[i], "emerald");
  }
}
