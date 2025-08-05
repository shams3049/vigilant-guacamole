import React, { useEffect, useState } from 'react';
import { polarToCartesian, type Sector } from '../utils';

export default function IconLabelLayer({
  sectors,
  center,
  radius,
  iconSize,
  fontSize,
}: {
  sectors: Sector[];
  center: number;
  radius: number;
  iconSize: number;
  fontSize: number;
}) {
  // Animation state: which section is currently animating
  const [activeSection, setActiveSection] = useState(-1);

  useEffect(() => {
    // Start all sections animating in parallel with slight stagger
    setActiveSection(-1);
    const timeout = setTimeout(() => {
      setActiveSection(sectors.length - 1); // Show all sections at once
    }, 100); // Short delay before showing all
    
    return () => clearTimeout(timeout);
  }, [sectors.length]);

  return (
    <g>
      {sectors.map((s, i) => {
        // Place each icon and label at the correct angle and distance
        const angle = s.angle;
        const pos = polarToCartesian(center, center, radius, angle);
        const boxWidth = iconSize * 2.5;
        const boxHeight = iconSize * 2.4;
        // Slight offset to keep first label visible
        const xOffset = i === 0 ? boxWidth * 0.1 : 0;
        return (
          <foreignObject
            key={i}
            // Center the icon and label at the calculated position, with offset for first sector
            x={pos.x - boxWidth / 2 + xOffset}
            y={pos.y - boxHeight / 2}
            width={boxWidth}
            height={boxHeight}
            style={{
              opacity: i <= activeSection ? 1 : 0,
              transform: i <= activeSection ? 'scale(1)' : 'scale(0.7)',
              transition: 'opacity 0.4s, transform 0.4s cubic-bezier(0.4,2,0.6,1)',
              transitionDelay: `${i * 50}ms`, // Small stagger for each icon (50ms apart)
            }}
          >
            {/* Render icon and label in a vertical flex layout */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: fontSize * 0.45,
              textAlign: 'center',
              lineHeight: 1.1,
              color: '#000',
              padding: '6px 12px',
              boxSizing: 'border-box',
            }}>
              <div
                style={{
                  backgroundColor: '#F6E2CA',
                  borderRadius: '50%',
                  width: iconSize * 1.4,
                  height: iconSize * 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={s.icon}
                  alt={s.label}
                  style={{ width: iconSize, height: iconSize }}
                />
              </div>
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
