// Zet op true om debug-logs in de console te tonen.
export const DEBUG = false

/**
 * Toont logregels alleen wanneer DEBUG aan staat.
 */ 
export function debug(...args) {
    if (!DEBUG) return;
    console.log(...args);   
}