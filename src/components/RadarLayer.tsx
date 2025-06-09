import React from 'react';

// Converts polar coordinates to cartesian coordinates for SVG
function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

// Returns SVG arc path for a given circle segment
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
  sectorAngle,
  angleOffset = 0,
  useUniformSectorColor = false,
}: {
  values: number[];
  center: number;
  max: number;
  radius: number;
  barWidth: number;
  gap: number;
  sectorAngle: number;
  angleOffset?: number;
  useUniformSectorColor?: boolean;
}) {
  return (
    <g>
      {values.map((strength, sectorIndex) => {
        // Calculate the base angle for this sector
        const baseAngle = -90 + angleOffset + sectorIndex * sectorAngle;
        // Pick color for the sector
        const sectorColor = COLORS[Math.max(0, Math.min(strength - 1, COLORS.length - 1))];

        return Array.from({ length: max }, (_, barIndex) => {
          // Calculate radius for each bar
          const r = radius + barIndex * (barWidth + gap);
          // Calculate gap between bars based on radius
          const perimeterGap = (r / 100) * 1.6;
          const effectiveGap = Math.max(4, perimeterGap);
          // Calculate arc angle for each bar
          const arcAngle = sectorAngle - effectiveGap;
          const startAngle = baseAngle + effectiveGap / 2;
          const endAngle = startAngle + arcAngle;
          // Determine if this bar is active (filled)
          const active = barIndex + 1 <= strength;
          // Choose color for active/inactive bar
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
            />
          );
        });
      })}
    </g>
  );
}