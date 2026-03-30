import { el, state } from "./state.js";
import { toggleButton, resetButton, activateButton } from "./ui-utils.js";
import { showIntercourseModal, updateIntercourseDisplay } from "./model-manager.js";

// Koppelt clicks voor period- en intercourse-switches.
export function initSwitches() {
    // Toggle menstruatieknop direct op klik.
    el("switchPeriod").onclick = () => {
        toggleButton(el("switchPeriod"), "from-rose-200", "to-pink-200", "border-rose-500", "text-rose-800");
    };

    // Opent keuze-modal voor intercourse.
    el("switchIntercourse").onclick = showIntercourseModal;
}

/**
 * Laad switch states van entry
 */

export function loadSwitchStates(entry) {
    // Veilige default wanneer entry ontbreekt.
    let isPeriod = false;
    if (entry && entry.isPeriod !== undefined && entry.isPeriod !== null) {
        isPeriod = entry.isPeriod;
    }

    // Intercoursestatus kan null zijn.
    let intercourse = null;
    if (entry && entry.intercourse !== undefined) {
        intercourse = entry.intercourse;
    }

    // Zet period-knop naar juiste visuele status.
    if (isPeriod) {
        activateButton(el("switchPeriod"), "from-rose-200", "to-pink-200", "border-rose-500", "text-rose-800");
    } else {
        resetButton(el("switchPeriod"), "rose");
    }

    // Synchroniseer intercourse-selectie + knopweergave.
    state.selectedIntercourse = intercourse;
    updateIntercourseDisplay();
}

// Geeft huidige intercourse-keuze terug voor opslaan in entry.
export function getIntercourse() { 
    return state.selectedIntercourse;   
}

// Controleert of period-knop momenteel actief is.
export function isPeriodActive() {
    const periodButton = el("switchPeriod");
    if (!periodButton) {
        return false;
    }
    return periodButton.classList.contains("bg-gradient-to-r");
}