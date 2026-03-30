import { state } from "./state.js";

 // past de privacy-class op de body toe op basis van config
export function applyPrivacy() {
    document.body.classList.t// oggle("privacy-mode", !!state.data.config.privacyMode);
}

export function togglePrivacy() {
    state.data.config.privacyMode = !state.data.config.privacyMode;
    applyPrivacy();
}