import React from 'react';

interface GuideLinesLayerProps {
  sectors: { label: string; icon: string; angle: number }[];
  center: number;
  innerRadius: number;
  outerRadius: number;
}

// Converts polar coordinates to cartesian coordinates for SVG
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function GuideLinesLayer({
  sectors, center, innerRadius, outerRadius
}: GuideLinesLayerProps) {
  return (
    <g>
      {sectors.map((s, i) => {
        const angle = s.angle;
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