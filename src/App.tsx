import ResponsiveRadarChart from './components/ResponsiveRadarChart';

// Section keys for URL parameter parsing
const SECTION_KEYS = [
  "bewegung",
  "ernaehrung_genuss",
  "stress_erholung",
  "geist_emotion",
  "lebenssinn_qualitaet",
  "umwelt_soziales",
];

// Parse strengths from URL parameters, fallback to 2 if not present
function parseStrengths(): number[] {
  const params = new URLSearchParams(window.location.search);
  return SECTION_KEYS.map(key => {
    const val = Number(params.get(key));
    return isNaN(val) ? 2 : Math.max(0, Math.min(9, val));
  });
}

export default function App() {
  // Get values from URL
  const values = parseStrengths();
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <ResponsiveRadarChart values={values} />
    </div>
  );
}