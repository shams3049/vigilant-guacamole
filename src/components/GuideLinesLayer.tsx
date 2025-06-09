import React from 'react';

interface GuideLinesLayerProps {
  count: number;
  center: number;
  angleStep: number;
  innerRadius: number;
  outerRadius: number;
}

// Converts polar coordinates to cartesian coordinates for SVG
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function GuideLinesLayer({
  count, center, angleStep, innerRadius, outerRadius
}: GuideLinesLayerProps) {
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        // Calculate angle for each guideline
        const angle = i * angleStep;
        // Calculate start and end points for the guideline
        const p1 = polarToCartesian(center, center, innerRadius, angle);
        const p2 = polarToCartesian(center, center, outerRadius, angle);
        return (
          <line
            key={`guide-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#ccc"
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
}