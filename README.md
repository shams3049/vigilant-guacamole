# Radar Chart Widget

A responsive, animated radar chart widget built with React, TypeScript, and Vite. Perfect for displaying wellness or performance metrics across multiple categories.

## Features

- **Responsive Design**: Adapts seamlessly to all screen sizes
- **Smooth Animations**: Fast, parallel animations 
- **Interactive**: Clickable pointer with wobble animation
- **Accessible**: Keyboard navigation and screen reader support
- **URL-Driven**: Chart values controlled via URL parameters

## Usage

The chart reads values from URL query parameters. Each parameter accepts a number from `0` to `9`:

```
?bewegung=7&ernaehrung_genuss=5&stress_erholung=3&geist_emotion=8&lebenssinn_qualitaet=6&umwelt_soziales=4
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

- `bewegung` - Movement/Exercise  
- `ernaehrung_genuss` - Nutrition & Enjoyment
- `stress_erholung` - Stress & Recovery
- `geist_emotion` - Mind & Emotion
- `lebenssinn_qualitaet` - Life Purpose & Quality
- `umwelt_soziales` - Environment & Social
