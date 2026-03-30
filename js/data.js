export const DATA_URL = "./data.json";

// Laadt de standaarddata uit data.json.
export async function loadDefaults() {
    const res = await fetch(DATA_URL);

    // Stop met duidelijke foutmelding als laden mislukt.
    if (!res.ok) throw new Error("Kon data.json niet laden")

    return res.json();
}