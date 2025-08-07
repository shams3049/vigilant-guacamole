# Radar Chart Widget

A responsive, animated radar chart widget built with React, TypeScript, and Vite. Perfect for displaying wellness or performance metrics across multiple categories.

## Features

- **Responsive Design**: Adapts seamlessly to all screen sizes
- **Smooth Animations**: Staggered animations with performance optimization
- **Interactive**: Animated radar visualization
- **German Localization**: Wellness categories in German
- **URL-Driven**: Chart values controlled via URL parameters

## Demo

Visit the live demo: [https://vigilant-guacamole.vercel.app/](https://vigilant-guacamole.vercel.app/)

## Usage

The chart reads values from URL query parameters. Each parameter accepts a number from `0` to `9`:

```url
?koerper_bewegung=7&ernaehrung_genuss=5&stress_erholung=3&geist_emotion=8&lebenssinn_qualitaet=6&umwelt_soziales=4
```

Example URL with all parameters:

```url
https://vigilant-guacamole.vercel.app/?koerper_bewegung=9&ernaehrung_genuss=8&stress_erholung=6&geist_emotion=7&lebenssinn_qualitaet=5&umwelt_soziales=4
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

## Categories

The wellness categories displayed on the radar chart:

- **Körper & Bewegung** (`koerper_bewegung`) - Body & Movement  
- **Ernährung & Genuss** (`ernaehrung_genuss`) - Nutrition & Enjoyment
- **Stress & Erholung** (`stress_erholung`) - Stress & Recovery
- **Geist & Emotionen** (`geist_emotion`) - Mind & Emotions
- **Lebenssinn & -qualität** (`lebenssinn_qualitaet`) - Life Purpose & Quality
- **Umwelt & Soziales** (`umwelt_soziales`) - Environment & Social
