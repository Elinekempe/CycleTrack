const DAY_MS = 86400000;

// Gemiddeld nemen en afronden, of fallback teruggeven.
function averageRounded(values, fallbackValue) {
    if (!values.length) return fallbackValue;

    let total = 0;
    for (let i = 0; i < values.length; i++) {
        total += values[i];
    }

    return Math.round(total / values.length);
}

// Leest fallback-waardes uit cycle-data (met veilige defaults).
function resolveCycleFallbacks(fallbackCycle) {
    let fallbackLength = 28;
    let fallbackPeriodLength = 5;

    if (fallbackCycle && fallbackCycle.length) {
        fallbackLength = fallbackCycle.length;
    }

    if (fallbackCycle && fallbackCycle.periodLength) {
        fallbackPeriodLength = fallbackCycle.periodLength;
    }

    return { fallbackLength, fallbackPeriodLength };
}

// Haalt alleen periodedagen uit alle entries en sorteert die op datum.
export function getSortedPeriodEntries(entries) {
    if (!entries) return [];

    const result = [];
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        // Alleen dagen die expliciet als menstruatie staan gelogd meenemen.
        if (entry && entry.isPeriod) {
            result.push(entry);
        }
    }
// Sorteren op datum (oudste eerst).
    result.sort((a, b) => new Date(a.date) - new Date(b.date));
    return result;
}

// Bundelt opeenvolgende periodedagen tot losse menstruatiegroepen.
export function buildPeriodGroups(periodEntries) {
    if (!periodEntries.length) return [];

    const groups = [];
    let currentGroup = [periodEntries[0]];

    // berekent het aantal dagen tussen opeenvolgende periodedagen om groepen te vormen.
    for (let i = 1; i < periodEntries.length; i++) {
        const prev = new Date(periodEntries[i - 1].date);
        const curr = new Date(periodEntries[i].date);
        const daysBetween = Math.floor((curr - prev) / DAY_MS);

        // Dag sluit direct aan op vorige dag => zelfde menstruatiegroep.
        if (daysBetween === 1) {
            currentGroup.push(periodEntries[i]);
            continue;
        }

        // Gat in dagen => vorige groep afsluiten en nieuwe starten.
        groups.push(currentGroup);
        currentGroup = [periodEntries[i]];
    }

    groups.push(currentGroup);
    return groups;
}

// Berekent gemiddelde cycluslengte op basis van afstand tussen starts van groepen.
export function getAverageCycleLength(periodEntries, fallbackLength = 28) {
    const periodGroups = buildPeriodGroups(periodEntries);
    if (periodGroups.length < 2) return fallbackLength;

    const cycleStarts = [];
    for (let i = 0; i < periodGroups.length; i++) {
        cycleStarts.push(new Date(periodGroups[i][0].date));
    }

    const validIntervals = [];
    for (let i = 1; i < cycleStarts.length; i++) {
        const prev = cycleStarts[i - 1];
        const curr = cycleStarts[i];
        const daysBetween = Math.floor((curr - prev) / DAY_MS);

        // Alleen realistische cycli gebruiken om uitschieters te beperken.
        if (daysBetween > 15 && daysBetween < 45) {
            validIntervals.push(daysBetween);
        }
    }

    return averageRounded(validIntervals, fallbackLength);
}

// Berekent gemiddelde duur van menstruatie op basis van groepslengtes.
export function getAveragePeriodLength(periodGroups, fallbackPeriodLength = 5) {
    if (!periodGroups.length) return fallbackPeriodLength;

    const periodLengths = [];
    for (let i = 0; i < periodGroups.length; i++) {
        // Groepslengte = aantal opeenvolgende periodedagen.
        periodLengths.push(periodGroups[i].length);
    }

    return averageRounded(periodLengths, fallbackPeriodLength);
}

// Haalt alle menstruatiedagen op en sorteert deze
export function getCycleMetrics(entries, fallbackCycle) {
    const periodEntries = getSortedPeriodEntries(entries);
    const periodGroups = buildPeriodGroups(periodEntries);
    const { fallbackLength, fallbackPeriodLength } = resolveCycleFallbacks(fallbackCycle);

    // bereken gemiddelde cycluslengte en menstruatieduur
    const avgLength = getAverageCycleLength(periodEntries, fallbackLength);
    const avgPeriodLength = getAveragePeriodLength(periodGroups, fallbackPeriodLength);
    // Ovulatie als simpele benadering in het midden van de cyclus.
    const ovulationDay = Math.round(avgLength / 2);

    // Laatste gelogde periodedag
    let lastPeriodStart = null;
    if (periodEntries.length) {
        lastPeriodStart = new Date(periodEntries[periodEntries.length - 1].date);
    }

    return {
        periodEntries,
        periodGroups,
        avgLength,
        avgPeriodLength,
        ovulationDay,
        lastPeriodStart,
    };
}

