import ResponsiveRadarChart from './components/ResponsiveRadarChart';

// Section keys correspond to URL parameters for each wellness category
// Arranged clockwise starting from 12 o'clock
const SECTION_KEYS = [
  "koerper_bewegung",      // Körper & Bewegung (12 o'clock)
  "ernaehrung_genuss",     // Ernährung & Genuss (2 o'clock)
  "stress_erholung",       // Stress & Erholung (4 o'clock)
  "geist_emotionen",       // Geist & Emotionen (6 o'clock)
  "lebenssinn_qualitaet",  // Lebenssinn & -qualität (8 o'clock)
  "umwelt_soziales",       // Umwelt & Soziales (10 o'clock)
];

// Accept common alias keys from legacy/variant links
const PARAM_ALIASES: Record<string, string[]> = {
  geist_emotionen: ["geist_emotion"],
};

// Parse values for each category from the query string. If a value is missing
// or invalid it falls back to `2` so the chart always has reasonable data.
function parseStrengths(): number[] {
  const params = new URLSearchParams(window.location.search);
  return SECTION_KEYS.map((key) => {
    // Try the canonical key first
    let raw = params.get(key);
    // Fall back to any alias keys if needed
    if (raw === null && PARAM_ALIASES[key]) {
      for (const alt of PARAM_ALIASES[key]) {
        const v = params.get(alt);
        if (v !== null) {
          raw = v;
          break;
        }
      }
    }

    const val = Number(raw);
    // Default to 2 if missing/invalid, clamp to [0,9]
    return isNaN(val) ? 2 : Math.max(0, Math.min(9, val));
  });
}

export default function App() {
  // Get values for each sector from the URL
  const values = parseStrengths();
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <ResponsiveRadarChart values={values} />
    </div>
  );
}
