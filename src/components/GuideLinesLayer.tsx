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

  // Reconstruct the label box geometry to compute where the inward edge lies along the ray
  const boxWidth = Math.round(iconSize * 2.8);
  // Estimate box height similar to IconLabelLayer: icon + margin + at least one line
  const iconBlock = Math.round(iconSize * 0.9);
  const effFont = Math.max(fontSize * 0.98, 12);
  const marginTop = Math.max(4, Math.round(effFont * 0.3));
  const lineHeightPx = Math.round(effFont * 1.1);
  const minLinesBlock = lineHeightPx; // at least one line; actual may be larger but inward extent uses axis-aligned half extents
  const paddingBlock = 8;
  const boxHeight = Math.round(iconBlock + marginTop + minLinesBlock + paddingBlock);

        // Nominal label center at base label radius
        const nominal = polarToCartesian(center, center, labelRadius, angle);
        const dx = nominal.x - center;
        const dy = nominal.y - center;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        // Inward half-extent of the axis-aligned box along the radial direction
        const inwardHalfExtent = Math.abs(ux) * (boxWidth / 2) + Math.abs(uy) * (boxHeight / 2);

        // Final label center radius (same as IconLabelLayer logic)
        const finalLabelCenterRadius = Math.max(labelRadius, avoidRadius + safetyGap + inwardHalfExtent);

        // Radius to the box's inward edge where the guideline should touch
        const touchRadius = finalLabelCenterRadius - inwardHalfExtent;

        // Ensure we don't create a negative/zero-length line (clamp slightly beyond innerRadius)
        const endRadius = Math.max(innerRadius, Math.min(touchRadius, outerRadius));

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
            opacity={visible[i] ? 1 : 0.2}
          />
        );
      })}
    </g>
  );
}
