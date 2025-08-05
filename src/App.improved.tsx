import React, { useMemo } from 'react';
import ResponsiveRadarChart from './components/ResponsiveRadarChart.improved';

// Section keys correspond to URL parameters for each wellness category
const SECTION_KEYS = [
  "bewegung",
  "ernaehrung_genuss",
  "stress_erholung",
  "geist_emotion",
  "lebenssinn_qualitaet",
  "umwelt_soziales",
] as const;

// Memoized URL parsing to prevent recalculation on every render
function useUrlValues(): number[] {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return SECTION_KEYS.map(key => {
      const val = Number(params.get(key));
      return isNaN(val) ? 2 : Math.max(0, Math.min(9, val));
    });
  }, []); // Empty dependency array since URL doesn't change during component lifecycle
}

export default function App() {
  // Get values for each sector from the URL
  const values = useUrlValues();
  
  return (
    <div className="radar-container w-screen h-screen flex items-center justify-center bg-white">
      <ResponsiveRadarChart values={values} />
    </div>
  );
}
