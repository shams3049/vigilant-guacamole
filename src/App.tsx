import ResponsiveRadarChart from './components/ResponsiveRadarChart';

// Section keys correspond to URL parameters for each wellness category
const SECTION_KEYS = [
  "bewegung",
  "ernaehrung_genuss",
  "stress_erholung",
  "geist_emotion",
  "lebenssinn_qualitaet",
  "umwelt_soziales",
];

// Parse values for each category from the query string. If a value is missing
// or invalid it falls back to `2` so the chart always has reasonable data.
function parseStrengths(): number[] {
  const params = new URLSearchParams(window.location.search);
  return SECTION_KEYS.map(key => {
    const val = Number(params.get(key));
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
