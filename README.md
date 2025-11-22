# Radar Chart Widget

A responsive, animated radar chart widget built with React, TypeScript, and Vite. Perfect for displaying wellness or performance metrics across multiple categories.

## Features

- **Responsive Design**: Adapts seamlessly to all screen sizes
- **Smooth Animations**: Staggered animations with performance optimization
- **Interactive**: Animated radar visualization
- **Customizable Colors**: Full control over all colors used in the chart
- **Reusable Component**: Can be integrated into any React application
- **German Localization**: Wellness categories in German (default)
- **URL-Driven**: Chart values controlled via URL parameters (in demo app)

## Using as a Component

The radar chart is now available as a **reusable React component** that can be integrated into any application! 

### Quick Start

```tsx
import ResponsiveRadarChart from './components/ResponsiveRadarChart';

function MyApp() {
  const values = [7, 5, 3, 8, 6, 4]; // Your data (0-10 scale)
  
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ResponsiveRadarChart values={values} />
    </div>
  );
}
```

### Custom Colors

You can customize all colors to match your brand:

```tsx
import ResponsiveRadarChart from './components/ResponsiveRadarChart';
import type { RadarChartColors } from './utils';

const myColors: RadarChartColors = {
  full: "#1E40AF",       // Blue for high scores
  medium: "#3B82F6",     // Medium blue
  low: "#FCD34D",        // Yellow
  lowest: "#EF4444",     // Red
  inactive: "#D1D5DB",   // Gray
  primary: "#1F2937",    // Borders & guidelines
  background: "#F3F4F6", // Center circle
  labelBackground: "#FFFFFF",
  iconBackground: "#E5E7EB",
};

function MyApp() {
  return (
    <ResponsiveRadarChart 
      values={[7, 5, 3, 8, 6, 4]}
      colors={myColors}
    />
  );
}
```

**📖 For complete documentation and examples, see [COMPONENT_USAGE.md](./COMPONENT_USAGE.md)**

## Demo App Usage

The chart reads values from URL query parameters. Each parameter accepts a number from `0` to `9`:

```url
?koerper_bewegung=7&ernaehrung_genuss=5&stress_erholung=3&geist_emotion=8&lebenssinn_qualitaet=6&umwelt_soziales=4
```

Example URL with all parameters:

```url
https://vigilant-guacamole-gemit.vercel.app/?koerper_bewegung=9&ernaehrung_genuss=8&stress_erholung=6&geist_emotion=7&lebenssinn_qualitaet=5&umwelt_soziales=4
```

If a value is missing or invalid, it defaults to `2`.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

For Vercel deployment:

1. Push your project to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy

## Default Categories

The wellness categories displayed on the radar chart:

- **Körper & Bewegung** (`koerper_bewegung`) - Body & Movement  
- **Ernährung & Genuss** (`ernaehrung_genuss`) - Nutrition & Enjoyment
- **Stress & Erholung** (`stress_erholung`) - Stress & Recovery
- **Geist & Emotionen** (`geist_emotion`) - Mind & Emotions
- **Lebenssinn & -qualität** (`lebenssinn_qualitaet`) - Life Purpose & Quality
- **Umwelt & Soziales** (`umwelt_soziales`) - Environment & Social

## Component Files

To use this radar chart in your own application, copy these files:

- `src/components/ResponsiveRadarChart.tsx` - Main component
- `src/components/RadarLayer.tsx` - Radar bars layer
- `src/components/GuideLinesLayer.tsx` - Guidelines between sectors
- `src/components/IconLabelLayer.tsx` - Icons and labels
- `src/utils.ts` - Utility functions
- `src/types.ts` - TypeScript types and interfaces

See [COMPONENT_USAGE.md](./COMPONENT_USAGE.md) for detailed integration instructions.

