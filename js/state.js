import { debug } from "./logger.js";

// Centrale applicatiestatus
export const state = { 
    defaults: null,
    data: null,
    selectedDate: null, 
    selectedIntercourse: null,
    currentDate: new Date(),
    filter: { symptom: "", mood: "" }
};


// Haalt een DOM-element op via zijn ID
export const el = (id) => document.getElementById(id);

// Geeft fallback terug wanneer waarde ontbreekt.
function valueOrDefault(value, fallback) {
    if (value === undefined || value === null) {
        return fallback;
    }
    return value;
}

// Neemt de eerste gedefinieerde waarde uit een lijst.
function firstDefinedValue(values, fallback) {
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value !== undefined && value !== null) {
            return value;
        }
    }
    return fallback;
}


// Normaliseert ruwe data naar het verwachte formaat
 
export function normalizeData(inputData) {
    const source = inputData || {};

    // Ondersteunt oud JSON-formaat met startData.
    if (inputData && inputData.startData) { 
        return {
            config: { 
                appName: valueOrDefault(inputData.appName, "CycleTrack"), 
                storageKey: valueOrDefault(inputData.storageKey, "cycletrack.v1"), 
                locale: "nl-NL", 
                privacyMode: false 
            },
            catalog: { 
                symptoms: valueOrDefault(inputData.symptoms, []), 
                moods: valueOrDefault(inputData.moods, []), 
                tags: [] 
            },
            cycles: valueOrDefault(inputData.startData.cycles, []),
            entries: valueOrDefault(inputData.startData.entries, []),
            reminders: [],
            insights: {}
        };
    }

    const config = source.config || {};
    const catalog = source.catalog || {};

    // Nieuw formaat: normaliseren met veilige defaults.
    return {
        config: {
            appName: valueOrDefault(config.appName, "CycleTrack"),
            storageKey: firstDefinedValue([config.storageKey, config.storeageKey], "cycletrack.v1"),
            locale: valueOrDefault(config.locale, "nl-NL"),
            privacyMode: firstDefinedValue([config.privacyMode, config.privateMode], false),
        },
        catalog: {
            symptoms: valueOrDefault(catalog.symptoms, []),
            moods: valueOrDefault(catalog.moods, []),
            tags: valueOrDefault(catalog.tags, []),
        },
        cycles: valueOrDefault(source.cycles, []),
        entries: valueOrDefault(source.entries, []),
        reminders: valueOrDefault(source.reminders, []),
        insights: valueOrDefault(source.insights, {}),
    };
}

// Stelt de standaardwaarden in

export function setDefaults(d) { 
    state.defaults = d; 
}

// Stelt de huidige data in
export function setData(d) { 
    state.data = normalizeData(d); 
}


// Slaat data op in localStorage
export function   saveStorage(key, data) {
    try { 
        const json = JSON.stringify(data); 

        // Schrijft complete app-data onder één storage-key.
        localStorage.setItem(key, json);

        debug(`💾 Data opgeslagen in localStorage`);
        debug(`   Key: "${key}"`);
        debug(`   Grootte: ${(json.length / 1024).toFixed(2)} KB`);
        let entryCount = 0;
        if (data.entries) {
            entryCount = data.entries.length;
        }
        debug(`   Entries: ${entryCount}`);
    } catch (err) {
        console.error(`❌ Fout bij opslaan in localStorage:`, err);
        console.error(`   Error name: ${err.name}`);
        console.error(`   Error message: ${err.message}`);

        if (err.name === "QuotaExceededError") {
            alert("❌ Storage vol! Wis enkele gegevens of export/import.");
        } else {
            alert(`❌ Fout bij opslaan: ${err.message}`);
        }

        // Fout doorgeven zodat callers kunnen afhandelen.
        throw err;
    }
}


// Laadt data uit localStorage

export function loadStorage(key) {
    try { 
        const storedJson = localStorage.getItem(key);

        // Geen opgeslagen data gevonden.
        if (!storedJson) {
            debug(` Geen data in localStorage (key: "${key}")`);
            return null;
        }

        const parsed = JSON.parse(storedJson);
        debug(`Data geladen uit localStorage`);
        debug(`   Key: "${key}"`);
        let entryCount = 0;
        if (parsed.entries) {
            entryCount = parsed.entries.length;
        }
        debug(`   Entries: ${entryCount}`);
        
        // Altijd teruggeven in genormaliseerd formaat.
        return normalizeData(parsed);
    } catch (err) {  
        console.error(`❌ Fout bij laden uit localStorage:`, err);
        console.error(`   Error name: ${err.name}`);
        console.error(`   Error message: ${err.message}`);
        return null;    
    }
}


// Zoekt een entry op basis van datum

export function getEntry(dateStr) { 
    // Beschermt tegen opstart-state zonder data.
    if (!state.data || !state.data.entries) {
        return undefined;
    }

    // Zoek entry met exact dezelfde datumstring.
    for (let i = 0; i < state.data.entries.length; i++) {
        const entry = state.data.entries[i];
        if (entry.date === dateStr) {
            return entry;
        }
    }

    return undefined;
}