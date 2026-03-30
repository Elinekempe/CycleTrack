import { state } from "./state.js";

 // past de privacy-class op de body toe op basis van config
export function applyPrivacy() {
    document.body.classList.toggle("privacy-mode", !!state.data.config.privacyMode);
}

// Toggle privacy-modus aan/uit
export function togglePrivacy() {
    state.data.config.privacyMode = !state.data.config.privacyMode;
    applyPrivacy();
}