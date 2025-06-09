import React, { useRef, useState, useLayoutEffect } from 'react';
import RadarLayer from './RadarLayer';
import GuideLinesLayer from './GuideLinesLayer';
import IconLabelLayer from './IconLabelLayer';

// Sectors for the radar chart, each with a label and icon
const SECTORS = [
  { label: 'Bewegung', icon: '/assets/bewegung.svg' },
  { label: 'Ernährung & Genuss', icon: '/assets/ernaehrung_genuss.svg' },
  { label: 'Stress & Erholung', icon: '/assets/stress_erholung.svg' },
  { label: 'Geist & Emotion', icon: '/assets/geist_emotion.svg' },
  { label: 'Lebenssinn & -qualität', icon: '/assets/lebenssinn_qualitaet.svg' },
  { label: 'Umwelt & Soziales', icon: '/assets/umwelt_soziales.svg' },
];

export default function ResponsiveRadarChart({ values }: { values: number[] }) {
  // Ref for the container div
  const containerRef = useRef<HTMLDivElement>(null);
  // State for the chart size
  const [size, setSize] = useState(300);

  useLayoutEffect(() => {
    // Resize handler to keep chart responsive
    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setSize(Math.min(rect.width, rect.height));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Calculate chart geometry
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
  const angleStep = 360 / values.length;
  const angleOffset = 30;
  // Calculate average value and percent
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const avgPercent = Math.round((avg / max) * 100);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <svg width={size} height={size}>
        {/* Center circle and average percent */}
        <circle cx={center} cy={center} r={size * 0.07} fill="#ccc" />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.058}
          fontWeight="bold"
        >
          {avgPercent}%
        </text>

        {/* Radar bars */}
        <RadarLayer
          values={values}
          center={center}
          max={max}
          radius={radius}
          barWidth={barWidth}
          gap={gap}
          sectorAngle={angleStep}
          useUniformSectorColor={true}
        />

        {/* Guidelines */}
        <GuideLinesLayer
          count={values.length}
          center={center}
          angleStep={angleStep}
          innerRadius={guidelineInner}
          outerRadius={guidelineOuter}
        />

        {/* Icons and labels */}
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