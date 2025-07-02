import React, { useRef, useState, useLayoutEffect } from 'react';
import RadarLayer from './RadarLayer';
import GuideLinesLayer from './GuideLinesLayer';
import IconLabelLayer from './IconLabelLayer';
import type { Sector } from '../utils';

// Define the radar chart sectors with their labels, icons, and angles
const SECTORS: Sector[] = [
  { label: 'Bewegung', icon: '/assets/bewegung.svg', angle: -90 },
  { label: 'Ernährung & Genuss', icon: '/assets/ernaehrung_genuss.svg', angle: -30 },
  { label: 'Stress & Erholung', icon: '/assets/stress_erholung.svg', angle: 30 },
  { label: 'Geist & Emotion', icon: '/assets/geist_emotion.svg', angle: 90 },
  { label: 'Lebenssinn & -qualität', icon: '/assets/lebenssinn_qualitaet.svg', angle: 150 },
  { label: 'Umwelt & Soziales', icon: '/assets/umwelt_soziales.svg', angle: 210 },
];

export default function ResponsiveRadarChart({ values }: { values: number[] }) {
  // Reference to the chart container for responsive sizing
  const containerRef = useRef<HTMLDivElement>(null);
  // State to store the current chart size
  const [size, setSize] = useState(300);

  useLayoutEffect(() => {
    // Update chart size based on container dimensions
    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setSize(Math.min(rect.width, rect.height));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Calculate geometry and layout values for the chart
  const center = size / 2;
  const max = 9;
  const radius = size * 0.095;
  const barWidth = size * 0.021;
  const gap = size * 0.007;
  const iconRadius = size * 0.48;
  const guidelineInner = radius + max * (barWidth + gap);
  const guidelineOuter = iconRadius - 12;
  const iconSize = Math.min(size * 0.08, 36);
  const fontSize = size * 0.024;
  // Calculate the average value and its percentage
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const avgPercent = Math.round((avg / max) * 100);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
        {/* Center circle and average percent display */}
        <circle cx={center} cy={center} r={size * 0.07} fill="#F6E2CA" />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.058 * 0.85}
          fontWeight="bold"
        >
          {avgPercent}%
        </text>

        {/* Render radar bars for each sector */}
        <RadarLayer
          values={values}
          center={center}
          max={max}
          radius={radius}
          barWidth={barWidth}
          gap={gap}
          sectors={SECTORS}
        />

        {/* Render guidelines between sectors */}
        <GuideLinesLayer
          sectors={SECTORS}
          center={center}
          innerRadius={guidelineInner}
          outerRadius={guidelineOuter}
          iconSize={iconSize} // Pass iconSize for guideline adjustment
        />

        {/* Render icons and labels for each sector */}
        <IconLabelLayer
          sectors={SECTORS}
          center={center}
          radius={iconRadius}
          iconSize={iconSize}
          fontSize={fontSize}
        />
      </svg>
    </div>
  );
}
