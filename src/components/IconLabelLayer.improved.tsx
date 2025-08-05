import React, { useEffect, useState, useMemo } from 'react';
import { polarToCartesian, type Sector } from '../utils';

// Utility function to truncate text based on available space
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + '…';
}

// Responsive text sizing based on screen size
function getResponsiveTextConfig(fontSize: number, iconSize: number) {
  const minFontSize = Math.max(fontSize, 10);
  const maxCharsPerLine = Math.floor(iconSize * 2.5 / (minFontSize * 0.6));
  const lineHeight = minFontSize * 1.2;
  
  return {
    fontSize: minFontSize,
    maxCharsPerLine: Math.max(maxCharsPerLine, 8), // Minimum 8 chars
    lineHeight,
  };
}

// Split text into multiple lines if needed
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Handle very long words that exceed maxCharsPerLine
        lines.push(truncateText(word, maxCharsPerLine));
        currentLine = '';
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Limit to maximum 2 lines for readability
  return lines.slice(0, 2);
}

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

  // Memoized text configuration to prevent recalculation
  const textConfig = useMemo(() => getResponsiveTextConfig(fontSize, iconSize), [fontSize, iconSize]);

  useEffect(() => {
    let i = 0;
    setActiveSection(-1);
    const interval = setInterval(() => {
      setActiveSection(i);
      i++;
      if (i >= sectors.length) clearInterval(interval);
    }, 350); // 350ms per section
    return () => clearInterval(interval);
  }, [sectors.length]);

  return (
    <g>
      {sectors.map((s, i) => {
        // Place each icon and label at the correct angle and distance
        const angle = s.angle;
        const pos = polarToCartesian(center, center, radius, angle);
        const boxWidth = iconSize * 2.8; // Slightly wider for better text layout
        const boxHeight = iconSize * 3.2; // Taller to accommodate wrapped text
        
        // Dynamic offset based on position to prevent clipping
        const isLeftSide = pos.x < center;
        const isTopSide = pos.y < center;
        
        // Adjust positioning based on screen edge proximity
        let xOffset = 0;
        let yOffset = 0;
        
        // Prevent clipping on left/right edges
        if (pos.x - boxWidth / 2 < 0) {
          xOffset = boxWidth / 4;
        } else if (pos.x + boxWidth / 2 > center * 2) {
          xOffset = -boxWidth / 4;
        }
        
        // Prevent clipping on top/bottom edges
        if (pos.y - boxHeight / 2 < 0) {
          yOffset = boxHeight / 4;
        } else if (pos.y + boxHeight / 2 > center * 2) {
          yOffset = -boxHeight / 4;
        }

        // Wrap text for better readability
        const textLines = wrapText(s.label, textConfig.maxCharsPerLine);
        
        return (
          <foreignObject
            key={i}
            x={pos.x - boxWidth / 2 + xOffset}
            y={pos.y - boxHeight / 2 + yOffset}
            width={boxWidth}
            height={boxHeight}
            style={{
              opacity: i <= activeSection ? 1 : 0,
              transform: i <= activeSection ? 'scale(1)' : 'scale(0.7)',
              transition: 'opacity 0.4s, transform 0.4s cubic-bezier(0.4,2,0.6,1)',
              overflow: 'visible',
            }}
          >
            {/* Render icon and label in a vertical flex layout */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%',
              fontSize: textConfig.fontSize,
              textAlign: 'center',
              lineHeight: textConfig.lineHeight / textConfig.fontSize,
              color: '#000',
              padding: '4px',
              boxSizing: 'border-box',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '500',
            }}>
              {/* Icon container with better responsive sizing */}
              <div
                style={{
                  backgroundColor: '#F6E2CA',
                  borderRadius: '50%',
                  width: iconSize * 1.4,
                  height: iconSize * 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(61, 82, 65, 0.1)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <img
                  src={s.icon}
                  alt={s.label}
                  style={{ 
                    width: iconSize, 
                    height: iconSize,
                    objectFit: 'contain',
                  }}
                  loading="lazy"
                />
              </div>
              
              {/* Multi-line text container */}
              <div style={{
                marginTop: Math.max(4, textConfig.fontSize * 0.3),
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
              }}>
                {textLines.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    style={{
                      width: '100%',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      WebkitHyphens: 'auto',
                      textRendering: 'optimizeLegibility',
                      fontSize: textConfig.fontSize,
                      lineHeight: 1.1,
                      opacity: lineIndex === 1 ? 0.85 : 1, // Slightly fade second line
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </foreignObject>
        );
      })}
    </g>
  );
}
