// Zet knop terug naar neutrale/inactieve weergave.
export function resetButton(btn, colorClass = "slate") {
    btn.classList.remove("bg-gradient-to-r", `from-${colorClass}-200`, `to-pink-200`, `border-${colorClass}-500`, `text-${colorClass}-800`);
    btn.classList.add("border-slate-200", "bg-white/80", "text-slate-700");
}

/**
 * Activeert knop met aangegeven kleurschema
 */

export function activateButton(btn, fromColor, toColor, borderColor, textColor) {
    btn.classList.remove("border-slate-200", "text-slate-700");
    btn.classList.add("bg-gradient-to-r", fromColor, toColor, borderColor, textColor);
}

/**
 * Toggle button active/inactive status
 */

export function toggleButton(btn, fromColor = "from-rose-200", toColor = "to-pink-200", borderColor = "border-rose-500", textColor = "text-rose-800") {
    // Staat al aan: zet uit.
    if (btn.classList.contains("bg-gradient-to-r")) {
        btn.classList.remove("bg-gradient-to-r", fromColor, toColor, borderColor, textColor);
        btn.classList.add("border-slate-200", "bg-white/80", "text-slate-700"); 
    } else {
        // Staat uit: zet aan.
        btn.classList.add("bg-gradient-to-r", fromColor, toColor, borderColor, textColor);
        btn.classList.remove("border-slate-200", "text-slate-700"); 
    }
}

/**
 * Toast notificatie tonen
 */

export function showToast(msg, type = "info") {
    // Bouw toast-element en kies kleur per type.
    const toast = document.createElement("div"); 
        let toastColor = "bg-blue-500";
        if (type === "success") {
            toastColor = "bg-green-500";
        } else if (type === "error") {
            toastColor = "bg-red-500";
        }

    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white font-semibold shadow-lg z-50 ${
        toastColor
  }`;
  toast.textContent = msg;
  document.body.appendChild(toast);

    // Verwijder toast automatisch na korte fade-out.
  setTimeout(() => { 
    toast.style.transistion = "opacity 0.3s ease";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}