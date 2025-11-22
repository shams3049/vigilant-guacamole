# Radar Chart Component Usage

This guide shows how to use the radar chart component in your own application with custom colors.

## Installation

Copy the following files to your project:
- `src/components/ResponsiveRadarChart.tsx`
- `src/components/RadarLayer.tsx`
- `src/components/GuideLinesLayer.tsx`
- `src/components/IconLabelLayer.tsx`
- `src/utils.ts`
- `src/types.ts`

## Basic Usage

```tsx
import ResponsiveRadarChart from './components/ResponsiveRadarChart';

function MyApp() {
  // Define your data values (0-10 scale)
  const values = [7, 5, 3, 8, 6, 4];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ResponsiveRadarChart values={values} />
    </div>
  );
}
```

## Custom Sectors

You can define your own sectors with custom labels, icons, and angles:

```tsx
import ResponsiveRadarChart from './components/ResponsiveRadarChart';
import type { Sector } from './utils';

const MY_SECTORS: Sector[] = [
  { label: 'Performance', icon: '/icons/performance.svg', angle: 0 },
  { label: 'Quality', icon: '/icons/quality.svg', angle: 60 },
  { label: 'Security', icon: '/icons/security.svg', angle: 120 },
  { label: 'Scalability', icon: '/icons/scalability.svg', angle: 180 },
  { label: 'Maintainability', icon: '/icons/maintainability.svg', angle: 240 },
  { label: 'Documentation', icon: '/icons/documentation.svg', angle: 300 },
];

function MyApp() {
  const values = [8, 7, 9, 6, 5, 7];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ResponsiveRadarChart 
        values={values} 
        sectors={MY_SECTORS}
      />
    </div>
  );
}
```

## Custom Colors

You can customize all colors used in the radar chart. You only need to specify the colors you want to override - any omitted colors will use the defaults:

```tsx
import ResponsiveRadarChart from './components/ResponsiveRadarChart';

// Override just the colors you want to change
function MyApp() {
  const values = [7, 5, 3, 8, 6, 4];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ResponsiveRadarChart 
        values={values}
        colors={{
          full: "#1E40AF",      // Override high score color
          primary: "#1F2937",   // Override borders
          // All other colors will use defaults
        }}
      />
    </div>
  );
}
```

### Complete Color Customization

For full control, you can specify all colors:

```tsx
import ResponsiveRadarChart from './components/ResponsiveRadarChart';
import type { RadarChartColors } from './utils';

// Define your custom color scheme
const myColors: RadarChartColors = {
  full: "#1E40AF",       // Blue for high scores (9-10)
  medium: "#3B82F6",     // Medium blue (7-8)
  low: "#FCD34D",        // Yellow (4-6)
  lowest: "#EF4444",     // Red (0-3)
  inactive: "#D1D5DB",   // Gray for inactive bars
  primary: "#1F2937",    // Primary color for borders and guidelines
  background: "#F3F4F6", // Background color for center circle
  labelBackground: "#FFFFFF", // Background for label chips
  iconBackground: "#E5E7EB", // Background for icon badges
};

function MyApp() {
  const values = [7, 5, 3, 8, 6, 4];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ResponsiveRadarChart 
        values={values}
        colors={myColors}
      />
    </div>
  );
}
```

## Complete Example with All Options

```tsx
import ResponsiveRadarChart from './components/ResponsiveRadarChart';
import type { Sector, RadarChartColors } from './utils';

// Custom sectors for a software project evaluation
const PROJECT_SECTORS: Sector[] = [
  { label: 'Code Quality', icon: '/icons/code.svg', angle: 0 },
  { label: 'Test Coverage', icon: '/icons/test.svg', angle: 60 },
  { label: 'Security', icon: '/icons/shield.svg', angle: 120 },
  { label: 'Performance', icon: '/icons/speed.svg', angle: 180 },
  { label: 'Documentation', icon: '/icons/docs.svg', angle: 240 },
  { label: 'Team Satisfaction', icon: '/icons/team.svg', angle: 300 },
];

// Brand colors matching your application
const BRAND_COLORS: RadarChartColors = {
  full: "#10B981",       // Green for excellent (9-10)
  medium: "#34D399",     // Light green for good (7-8)
  low: "#FBBF24",        // Amber for moderate (4-6)
  lowest: "#F87171",     // Red for poor (0-3)
  inactive: "#E5E7EB",   // Gray for inactive
  primary: "#111827",    // Dark gray for borders
  background: "#F9FAFB", // Very light gray for center
  labelBackground: "#FFFFFF", // White for labels
  iconBackground: "#F3F4F6", // Light gray for icons
};

function ProjectDashboard() {
  // Your project scores
  const scores = [8, 7, 9, 6, 5, 8];

  return (
    <div className="project-dashboard">
      <h1>Project Health Dashboard</h1>
      <div style={{ width: '100%', height: '600px' }}>
        <ResponsiveRadarChart 
          values={scores}
          sectors={PROJECT_SECTORS}
          colors={BRAND_COLORS}
        />
      </div>
    </div>
  );
}

export default ProjectDashboard;
```

## Props Reference

### ResponsiveRadarChart Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `values` | `number[]` | Yes | - | Array of values (0-10) for each sector |
| `sectors` | `Sector[]` | No | Default wellness sectors | Array of sector definitions |
| `colors` | `Partial<RadarChartColors>` | No | Default color scheme | Custom color scheme (partial override supported) |

### Sector Type

```typescript
interface Sector {
  label: string;  // Display name for the sector
  icon: string;   // Path to SVG icon
  angle: number;  // Angle in degrees (0-360), typically in 60° increments for 6 sectors
}
```

### RadarChartColors Type

```typescript
interface RadarChartColors {
  full: string;       // Color for high scores (9-10)
  medium: string;     // Color for good scores (7-8)
  low: string;        // Color for moderate scores (4-6)
  lowest: string;     // Color for low scores (0-3)
  inactive: string;   // Color for inactive/unscored bars
  primary: string;    // Primary color for borders, guidelines, etc.
  background: string; // Background color for center circle
  labelBackground: string; // Background for label chips
  iconBackground: string; // Background for icon badges
}
```

## Notes

- The component is fully responsive and adapts to its container size
- Values should be in the range 0-10
- For 6 sectors, use angles: 0°, 60°, 120°, 180°, 240°, 300° (clockwise from top)
- The component includes smooth animations and transitions
- Icons should be SVG format for best results
- All colors accept standard CSS color formats (hex, rgb, rgba, etc.)
