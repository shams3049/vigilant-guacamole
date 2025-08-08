import React, { useEffect, useState, useMemo } from 'react';
import { polarToCartesian, type Sector } from '../utils';

// Responsive text sizing based on screen size
function getResponsiveTextConfig(fontSize: number, iconSize: number) {
  const minFontSize = Math.max(fontSize * 0.98, 12); // 2% smaller than provided fontSize
  const maxCharsPerLine = Math.floor(iconSize * 2.5 / (minFontSize * 0.6));
  const lineHeight = minFontSize * 1.2;
  
  return {
    fontSize: minFontSize,
    maxCharsPerLine: Math.max(maxCharsPerLine, 8), // Minimum 8 chars
    lineHeight,
  };
}

// Split text into multiple lines if needed (no cap; render all lines)
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
        // Very long single word: push as-is and let CSS break it
        lines.push(word);
        currentLine = '';
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export default function IconLabelLayer({
  sectors,
  center,
  radius, // base radius for placing labels
  iconSize,
  fontSize,
  avoidRadius, // keep labels at least this far from center (outer radar radius)
  safetyGap = 10, // minimum pixels between radar and the label box edge
  showLabels = false, // New: control reveal from parent
}: {
  sectors: Sector[];
  center: number;
  radius: number;
  iconSize: number;
  fontSize: number;
  avoidRadius: number;
  safetyGap?: number;
  showLabels?: boolean;
}) {
  // Memoized text configuration to prevent recalculation
  const textConfig = useMemo(() => getResponsiveTextConfig(fontSize, iconSize), [fontSize, iconSize]);

  return (
    <g>
      {sectors.map((s, i) => {
        const angle = s.angle;
  // Box width for icon + label stack (axis-aligned)
  const boxWidth = Math.round(iconSize * 2.8); // Slightly wider for better text layout

  // Wrap text for full rendering (no truncation/no cap)
  const textLines = wrapText(s.label, textConfig.maxCharsPerLine);

  // Calculate dynamic box height from content
  const iconBlock = Math.round(iconSize * 0.9);
  const marginTop = Math.max(4, Math.round(textConfig.fontSize * 0.3));
  const lineHeightPx = Math.round(textConfig.fontSize * 1.1);
  const linesBlock = textLines.length * lineHeightPx + Math.max(0, textLines.length - 1) * 1; // 1px gap between lines
  const paddingBlock = 8; // 4px top + 4px bottom from container padding
  const boxHeight = Math.round(iconBlock + marginTop + linesBlock + paddingBlock);

        // First compute the nominal position using the base radius
        const nominalPos = polarToCartesian(center, center, radius, angle);

        // Unit vector from center to position (radial outward)
        const dx = nominalPos.x - center;
        const dy = nominalPos.y - center;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        // How much an axis-aligned box extends toward the center along the radial direction
        // support function h_R(v) for rectangle with half-extents (w/2, h/2)
        const inwardHalfExtent = Math.abs(ux) * (boxWidth / 2) + Math.abs(uy) * (boxHeight / 2);

        // Minimum required distance from center to box center so that its inward edge clears the radar by safetyGap
        const minCenterDistance = avoidRadius + safetyGap + inwardHalfExtent;

        // Final placement radius
        const finalRadius = Math.max(radius, minCenterDistance);

        // Place each icon and label at the correct angle and distance
        const pos = polarToCartesian(center, center, finalRadius, angle);
        
        // Dynamic offset based on screen edges to prevent clipping near canvas bounds
        let xOffset = 0;
        let yOffset = 0;
        
        if (pos.x - boxWidth / 2 < 0) {
          xOffset = boxWidth / 4;
        } else if (pos.x + boxWidth / 2 > center * 2) {
          xOffset = -boxWidth / 4;
        }
        
        if (pos.y - boxHeight / 2 < 0) {
          yOffset = boxHeight / 4;
        } else if (pos.y + boxHeight / 2 > center * 2) {
          yOffset = -boxHeight / 4;
        }

        // Round coordinates to avoid sub-pixel issues in Safari/Firefox within foreignObject
        const fx = Math.round(pos.x - boxWidth / 2 + xOffset);
        const fy = Math.round(pos.y - boxHeight / 2 + yOffset);

        return (
          <foreignObject
            key={i}
            x={fx}
            y={fy}
            width={boxWidth}
            height={boxHeight}
            style={{
              opacity: 1, // no fade-in
              transform: showLabels ? 'scale(1)' : 'scale(0)',
              transformOrigin: '50% 50%',
              transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '0ms',
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
              // Improve cross-browser consistency inside foreignObject
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              contain: 'layout paint size',
              background: 'transparent',
            }}>
              {/* Icon container with better responsive sizing */}
              <div
                style={{
                  backgroundColor: '#F6E2CA',
                  borderRadius: '50%',
                  width: Math.round(iconSize * 0.9),
                  height: Math.round(iconSize * 0.9),
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
                    width: Math.round(iconSize * 0.6),
                    height: Math.round(iconSize * 0.6),
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  loading="lazy"
                />
              </div>
              
              {/* Multi-line text container */}
              <div style={{
                marginTop: Math.max(4, Math.round(textConfig.fontSize * 0.3)),
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
                      overflowWrap: 'anywhere',
                      hyphens: 'auto',
                      WebkitHyphens: 'auto',
                      textRendering: 'optimizeLegibility',
                      fontSize: textConfig.fontSize,
                      lineHeight: 1.1,
                      // Keep background fully opaque on the chip; do not dim the container.
                      background: 'transparent',
                      borderRadius: 0,
                      display: 'block',
                    }}
                  >
                    <span
                      style={{
                        background: '#FFFFFF', // ensure readability over guidelines
                        padding: '1px 3px',
                        borderRadius: 4,
                        boxShadow: 'none', // no border visible
                        border: 'none',
                        color: lineIndex === 1 ? 'rgba(0,0,0,0.85)' : 'inherit', // subtle text dim only
                      }}
                    >
                      {line}
                    </span>
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
