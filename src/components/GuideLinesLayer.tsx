import React, { useEffect, useState } from 'react';
import { polarToCartesian, type Sector } from '../utils';

interface GuideLinesLayerProps {
  sectors: Sector[];
  center: number;
  innerRadius: number;
  outerRadius: number;
  iconSize: number; // NEW: pass iconSize for guideline adjustment
}

export default function GuideLinesLayer({
  sectors, center, innerRadius, outerRadius, iconSize
}: GuideLinesLayerProps) {
  // Animation state: track which guidelines are visible
  const [visible, setVisible] = useState(Array(sectors.length).fill(false));

  useEffect(() => {
    // Animate all guidelines together with minimal stagger
    sectors.forEach((_, i) => {
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 20); // Very small stagger: 20ms per guideline
    });
  }, [sectors.length]);

  return (
    <g>
      {sectors.map((s, i) => {
        const angle = s.angle;
        const p1 = polarToCartesian(center, center, innerRadius + 10, angle);
        // Shorten guideline so it ends before the icon/label
        const guidelineEndRadius = outerRadius - (iconSize * 1.4); // adjust as needed
        const p2 = polarToCartesian(center, center, guidelineEndRadius, angle);
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
              transition: 'stroke-dashoffset 0.3s cubic-bezier(0.4,2,0.6,1), opacity 0.3s ease',
              transitionDelay: `${i * 20}ms`,
            }}
            opacity={visible[i] ? 1 : 0.2}
          />
        );
      })}
    </g>
  );
}
