import React, { useEffect, useState } from 'react';
import { polarToCartesian, type Sector } from '../utils';

interface GuideLinesLayerProps {
  sectors: Sector[];
  center: number;
  innerRadius: number; // outer edge of the outermost bar (where line should start)
  outerRadius: number; // general outer bound toward labels
  iconSize: number;
  fontSize: number;
  // New: parameters to match IconLabelLayer placement so we can touch the label box
  labelRadius: number; // base radius used for label box center (IconLabelLayer.radius)
  avoidRadius: number; // same as calculations.guidelineInner
  safetyGap?: number; // pixels between radar and label box (same default as IconLabelLayer)
}

export default function GuideLinesLayer({
  sectors,
  center,
  innerRadius,
  outerRadius,
  iconSize,
  fontSize,
  labelRadius,
  avoidRadius,
  safetyGap = 12,
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

        // Start exactly on the outermost bar edge
        const p1 = polarToCartesian(center, center, innerRadius, angle);

  // Compute icon center radius independent of label text (must match IconLabelLayer)
  const iconBadgeRadius = (iconSize * 0.9) / 2;
  const minIconCenterRadius = avoidRadius + safetyGap + iconBadgeRadius;
  const iconCenterRadius = Math.max(labelRadius, minIconCenterRadius);
  // Apply additional 20% on top (total 36% shorter from base)
  const shrinkFactor = 0.64;
  const endRadiusBase = iconCenterRadius - iconBadgeRadius; // icon inward edge
  const shortenedEnd = innerRadius + shrinkFactor * (endRadiusBase - innerRadius);
  // End the guideline at the shortened icon inward edge
  const endRadius = Math.max(innerRadius, Math.min(shortenedEnd, outerRadius));

        const p2 = polarToCartesian(center, center, endRadius, angle);

        // Length for stroke-dash animation
        const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        return (
          <line
            key={`guide-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#3D5241"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={visible[i] ? 0 : length}
            style={{
              transition: 'stroke-dashoffset 0.3s cubic-bezier(0.4,2,0.6,1), opacity 0.3s ease',
              transitionDelay: `${i * 20}ms`,
            }}
            opacity={visible[i] ? 0.95 : 0.18}
          />
        );
      })}
    </g>
  );
}
