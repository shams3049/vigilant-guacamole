import ResponsiveRadarChart from './components/ResponsiveRadarChart';
import type { Sector, RadarChartColors } from './utils';

// Example 1: Using default colors with custom sectors
const TECH_SECTORS: Sector[] = [
  { label: 'Frontend', icon: '/assets/bewegung.svg', angle: 0 },
  { label: 'Backend', icon: '/assets/ernaehrung_genuss.svg', angle: 60 },
  { label: 'DevOps', icon: '/assets/stress_erholung.svg', angle: 120 },
  { label: 'Testing', icon: '/assets/geist_emotion.svg', angle: 180 },
  { label: 'Security', icon: '/assets/lebenssinn_qualitaet.svg', angle: 240 },
  { label: 'Documentation', icon: '/assets/umwelt_soziales.svg', angle: 300 },
];

// Example 2: Custom color scheme for a different brand
const CUSTOM_COLORS: RadarChartColors = {
  full: "#2563EB",       // Blue for high scores (9-10)
  medium: "#60A5FA",     // Light blue (7-8)
  low: "#FBBF24",        // Amber (4-6)
  lowest: "#F87171",     // Red (0-3)
  inactive: "#D1D5DB",   // Gray for inactive bars
  primary: "#1E40AF",    // Dark blue for borders and guidelines
  background: "#EFF6FF", // Very light blue background
  labelBackground: "#FFFFFF", // White labels
  iconBackground: "#DBEAFE", // Light blue for icons
};

/**
 * Example component demonstrating how to use the radar chart
 * in a different application with custom colors
 */
export default function ExampleUsage() {
  // Example data values (0-10 scale)
  const techSkillLevels = [8, 7, 6, 9, 5, 7];

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F9FAFB',
      padding: '20px',
    }}>
      <h1 style={{ marginBottom: '20px', color: '#1F2937' }}>
        Tech Skills Radar Chart
      </h1>
      
      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        height: '600px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px',
      }}>
        <ResponsiveRadarChart 
          values={techSkillLevels}
          sectors={TECH_SECTORS}
          colors={CUSTOM_COLORS}
        />
      </div>

      <p style={{ marginTop: '20px', color: '#6B7280', maxWidth: '600px', textAlign: 'center' }}>
        This example demonstrates how to use the radar chart component with custom colors
        and sectors in your own application. See COMPONENT_USAGE.md for more details.
      </p>
    </div>
  );
}
