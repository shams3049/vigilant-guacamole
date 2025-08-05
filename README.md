# Radar Chart Widget

A responsive, animated radar chart widget built with React, TypeScript, and Vite. Perfect for displaying wellness or performance metrics across multiple categories.

## 🚀 Features

- **Responsive Design**: Adapts seamlessly to all screen sizes (320px to 1400px+)
- **Smooth Animations**: Fast, parallel animations that complete in under 1 second
- **Interactive**: Clickable pointer with wobble animation
- **Accessible**: Full keyboard navigation and screen reader support
- **Performance Optimized**: Hardware-accelerated animations and efficient rendering
- **URL-Driven**: Chart values controlled via URL parameters

## 📊 Usage

The chart reads the values for each wellness category from query parameters in the page URL. Each parameter accepts a number from `0` to `9`. For example:

```
http://localhost:5173/?bewegung=7&ernaehrung_genuss=5&stress_erholung=3&geist_emotion=8&lebenssinn_qualitaet=6&umwelt_soziales=4
```

If a value is missing or invalid, it defaults to `2`.

## Project Structure
```
radarChartStaticLoading/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── assets/
│       ├── bewegung.svg
│       ├── ernaehrung_genuss.svg
│       ├── geist_emotion.svg
│       ├── lebenssinn_qualitaet.svg
│       ├── stress_erholung.svg
│       └── umwelt_soziales.svg
└── src/
    ├── App.tsx
    ├── index.css
    ├── index.tsx
    ├── utils.ts
    └── components/
        ├── GuideLinesLayer.tsx
        ├── IconLabelLayer.tsx
        ├── RadarLayer.tsx
        └── ResponsiveRadarChart.tsx
```

## Local Development
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. Open your browser and test the app with a sample link:
   [http://localhost:5173/?bewegung=1&ernaehrung_genuss=2&stress_erholung=3&geist_emotion=4&lebenssinn_qualitaet=5&umwelt_soziales=1](http://localhost:5173/?bewegung=1&ernaehrung_genuss=2&stress_erholung=3&geist_emotion=4&lebenssinn_qualitaet=5&umwelt_soziales=1)

## Deploying to Vercel
1. Push your project to GitHub.
2. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
3. Click **New Project** and import your repository.
4. Vercel will auto-detect the Vite/React setup. Click **Deploy**.
5. After deployment, your app will be live on a Vercel URL (e.g., `https://your-project-name.vercel.app/`).
6. You can test the deployed app with a similar link (no port needed):
   `https://your-project-name.vercel.app/?bewegung=1&ernaehrung_genuss=2&stress_erholung=3&geist_emotion=4&lebenssinn_qualitaet=5&umwelt_soziales=1`

---

**Enjoy your responsive radar chart!**
