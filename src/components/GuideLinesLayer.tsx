import React, { useEffect, useState } from 'react';

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
  // Animation state: track which guidelines are visible
  const [visible, setVisible] = useState(Array(sectors.length).fill(false));

  useEffect(() => {
    // Animate guidelines one by one
    sectors.forEach((_, i) => {
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 120); // 120ms stagger per guideline
    });
  }, [sectors.length]);

  return (
    <g>
      {sectors.map((s, i) => {
        const angle = s.angle;
        const p1 = polarToCartesian(center, center, innerRadius + 10, angle);
        const p2 = polarToCartesian(center, center, outerRadius - 10, angle);
        // Animate line drawing using strokeDasharray and strokeDashoffset
        const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        return (
          <line
            key={`guide-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#000"
            strokeWidth={2}
            strokeDasharray={length}
            strokeDashoffset={visible[i] ? 0 : length}
            style={{
              transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,2,0.6,1)',
            }}
            opacity={visible[i] ? 1 : 0.2}
          />
        );
      })}
    </g>
  );
}