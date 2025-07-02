import React, { useEffect, useState } from 'react';
import { polarToCartesian, describeArc, type Sector } from '../utils';

const FULL_COLOR = "#3D5241";       // >= 50%
const MEDIUM_COLOR = "#7C987C";     // < 50%
const LOW_COLOR = "#FFAD4C";        // < 30%
const LOWEST_COLOR = "#FF8B7B";     // < 20%
const INACTIVE_COLOR = "#E0E0E0";

function getStrengthColor(strength: number, max: number): string {
  const percent = strength / max;
  if (percent >= 0.5) return FULL_COLOR;
  if (percent >= 0.3) return MEDIUM_COLOR;
  if (percent >= 0.2) return LOW_COLOR;
  return LOWEST_COLOR;
}

export default function RadarLayer({
  values,
  center,
  max,
  radius,
  barWidth,
  gap,
  sectors,
}: {
  values: number[];
  center: number;
  max: number;
  radius: number;
  barWidth: number;
  gap: number;
  sectors: Sector[];
}) {
  // Animation state: track which bars are visible (2D array)
  const [visible, setVisible] = useState(
    Array(values.length).fill(null).map(() => Array(max).fill(false))
  );

  useEffect(() => {
    values.forEach((strength, sectorIndex) => {
      for (let barIndex = 0; barIndex < max; barIndex++) {
        setTimeout(() => {
          setVisible(prev => {
            const next = prev.map(arr => [...arr]);
            next[sectorIndex][barIndex] = true;
            return next;
          });
        }, (sectorIndex * max + barIndex) * 60 + 200); // Stagger, start after guidelines
      }
    });
  }, [values.length, max]);

  const sectorArcAngle = 60; // Each sector covers 60 degrees (360/6)
  // Render radar bars for each sector and value
  return (
    <g>
      {values.map((strength, sectorIndex) => {
        const baseAngle = sectors[sectorIndex].angle;
        return Array.from({ length: max }, (_, barIndex) => {
          const r = radius + barIndex * (barWidth + gap);
          // Use a uniform gap between sectors so bars stay aligned
          const sectorGap = 6; // degrees of empty space between each sector
          const arcAngle = sectorArcAngle - sectorGap;
          const startAngle = baseAngle - arcAngle / 2;
          const endAngle = baseAngle + arcAngle / 2;
          const active = barIndex + 1 <= strength;
          const sectorColor = getStrengthColor(strength, max);
          const color = active ? sectorColor : INACTIVE_COLOR;
          return (
            <path
              key={`${sectorIndex}-${barIndex}`}
              d={describeArc(center, center, r, startAngle, endAngle)}
              stroke={color}
              strokeWidth={barWidth}
              fill="none"
              // Rounded line caps for softer bar edges
              strokeLinecap="round"
              style={{
                opacity: visible[sectorIndex][barIndex] ? 1 : 0,
                transform: visible[sectorIndex][barIndex] ? 'scale(1)' : 'scale(0.7)',
                transformOrigin: `${center}px ${center}px`,
                transition: 'opacity 0.4s, transform 0.4s cubic-bezier(0.4,2,0.6,1)',
                transitionDelay: `${(sectorIndex * max + barIndex) * 0.06 + 0.2}s`,
              }}
            />
          );
        });
      })}
    </g>
  );
}
