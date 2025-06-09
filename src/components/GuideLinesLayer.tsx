import React from 'react';

interface GuideLinesLayerProps {
  sectors: { label: string; icon: string; angle: number }[];
  center: number;
  innerRadius: number;
  outerRadius: number;
}

// Convert polar coordinates to cartesian for SVG line endpoints
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
        // Draw a guideline from just outside the last bar to just inside the icon
        const p1 = polarToCartesian(center, center, innerRadius + 10, angle);
        const p2 = polarToCartesian(center, center, outerRadius - 10, angle);
        return (
          <line
            key={`guide-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#000"
            strokeWidth={2}
          />
        );
      })}
    </g>
  );
}