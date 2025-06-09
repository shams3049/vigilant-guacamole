import React from 'react';

// Convert polar coordinates to cartesian for SVG placement
function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

export default function IconLabelLayer({
  sectors,
  center,
  radius,
  iconSize,
  fontSize,
}: {
  sectors: { label: string; icon: string; angle: number }[];
  center: number;
  radius: number;
  iconSize: number;
  fontSize: number;
}) {
  return (
    <g>
      {sectors.map((s, i) => {
        // Place each icon and label at the correct angle and distance
        const angle = s.angle;
        const pos = polarToCartesian(center, center, radius, angle);
        const boxWidth = iconSize * 2.8;
        const boxHeight = iconSize * 2.7;

        return (
          <foreignObject
            key={i}
            // Center the icon and label at the calculated position
            x={pos.x - boxWidth / 2}
            y={pos.y - boxHeight / 2}
            width={boxWidth}
            height={boxHeight}
          >
            {/* Render icon and label in a vertical flex layout */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%',
              fontSize: fontSize * 0.45,
              textAlign: 'center',
              lineHeight: 1.1,
              color: '#000',
              padding: '10px 16px',
              boxSizing: 'border-box',
            }}>
              <img src={s.icon} alt={s.label} style={{ width: iconSize, height: iconSize }} />
              <div style={{
                marginTop: 2,
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                width: '100%',
                whiteSpace: 'normal',
              }}>{s.label}</div>
            </div>
          </foreignObject>
        );
      })}
    </g>
  );
}