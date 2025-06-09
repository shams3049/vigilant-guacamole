import React, { useEffect, useState } from 'react';

// Convert polar coordinates to cartesian coordinates for SVG rendering
function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

// Generate an SVG arc path for a circular segment
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const COLORS = [
  "#FF0000", "#FF4000", "#FF8000", "#FFBF00",
  "#BFFF00", "#80FF00", "#40FF00", "#20C000", "#006400"
];
const INACTIVE_COLOR = "#E0E0E0";

export default function RadarLayer({
  values,
  center,
  max,
  radius,
  barWidth,
  gap,
  sectors,
  useUniformSectorColor = false,
}: {
  values: number[];
  center: number;
  max: number;
  radius: number;
  barWidth: number;
  gap: number;
  sectors: { label: string; icon: string; angle: number }[];
  useUniformSectorColor?: boolean;
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

  const totalSectors = sectors.length;
  const sectorArcAngle = 60; // Each sector covers 60 degrees (360/6)
  // Render radar bars for each sector and value
  return (
    <g>
      {values.map((strength, sectorIndex) => {
        const baseAngle = sectors[sectorIndex].angle;
        return Array.from({ length: max }, (_, barIndex) => {
          const r = radius + barIndex * (barWidth + gap);
          // Dynamically adjust the sector gap for each bar
          const minSectorGap = 2; // Minimum gap for outermost bar
          const maxSectorGap = 6; // Maximum gap for innermost bar
          const sectorGap = maxSectorGap - ((maxSectorGap - minSectorGap) * barIndex) / (max - 1);
          const arcAngle = sectorArcAngle - sectorGap;
          const startAngle = baseAngle - arcAngle / 2;
          const endAngle = baseAngle + arcAngle / 2;
          const active = barIndex + 1 <= strength;
          const sectorColor = COLORS[Math.max(0, Math.min(strength - 1, COLORS.length - 1))];
          const color = active
            ? (useUniformSectorColor ? sectorColor : COLORS[Math.min(barIndex, COLORS.length - 1)])
            : INACTIVE_COLOR;
          return (
            <path
              key={`${sectorIndex}-${barIndex}`}
              d={describeArc(center, center, r, startAngle, endAngle)}
              stroke={color}
              strokeWidth={barWidth}
              fill="none"
              strokeLinecap="butt"
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