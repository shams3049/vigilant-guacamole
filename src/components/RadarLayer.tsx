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
  const totalSectors = sectors.length;
  const sectorArcAngle = 60; // 360 / 6
  const sectorGap = 6; // degrees of gap between sectors
  return (
    <g>
      {values.map((strength, sectorIndex) => {
        const baseAngle = sectors[sectorIndex].angle;
        return Array.from({ length: max }, (_, barIndex) => {
          const r = radius + barIndex * (barWidth + gap);
          // Dynamically reduce the sector gap for outer bars
          const minSectorGap = 2; // minimum gap in degrees for outermost bar
          const maxSectorGap = 6; // maximum gap in degrees for innermost bar
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
            />
          );
        });
      })}
    </g>
  );
}