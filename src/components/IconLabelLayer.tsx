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

// Compute exactly two lines, scaling font-size down to fit within a given width.
function computeTwoLineLayout(
  text: string,
  boxWidthPx: number,
  startFontSize: number,
  minFontSize: number
): { lines: [string, string]; fontSize: number } {
  // Split into tokens, but also split on internal hyphens to encourage natural breaks.
  const rawWords = text.split(' ');
  const words = rawWords.flatMap(w => {
    // Keep leading or trailing hyphen as separate tokens to preserve semantics
    if (w.includes('-') && w.length > 1) {
      // Split but keep hyphens as standalone tokens when not at ends
      const pieces = w.split('-');
      const tokens: string[] = [];
      pieces.forEach((p, idx) => {
        if (p) tokens.push(p);
        if (idx < pieces.length - 1) tokens.push('-');
      });
      return tokens;
    }
    return [w];
  });

  // Helper to wrap into up to 2 lines given a max chars per line
  const wrapTwo = (maxChars: number): [string, string] => {
    let line1 = '';
    let line2 = '';
    for (const word of words) {
      const try1 = line1 ? `${line1} ${word}` : word;
      if (try1.length <= maxChars) {
        line1 = try1;
        continue;
      }
      // If word itself is longer than maxChars and line1 is empty, hard-split across lines
      if (!line1 && word.length > maxChars) {
        const head = word.slice(0, Math.max(1, maxChars - 1)) + '…';
        line1 = head;
        const remaining = word.slice(Math.max(1, maxChars - 1));
        if (remaining) {
          // Fill second line with remaining if possible
          const rem2 = remaining.slice(0, Math.max(1, maxChars - 1)) + (remaining.length > maxChars - 1 ? '…' : '');
          line2 = rem2;
        }
        break;
      }
      const try2 = line2 ? `${line2} ${word}` : word;
      if (try2.length <= maxChars) {
        line2 = try2;
      } else {
        // Word doesn't fit second line; truncate last token with ellipsis
        const token = word.slice(0, Math.max(1, maxChars - (line2 ? line2.length + 1 : 0) - 1));
        const spaced = line2 ? `${line2} ${token}` : token;
        line2 = spaced.slice(0, Math.max(1, maxChars - 1)) + '…';
        break;
      }
    }
    // Avoid empty first line; move content up if needed
    if (!line1 && line2) {
      line1 = line2;
      line2 = '';
    }
    return [line1, line2] as [string, string];
  };

  // Iteratively reduce font size until it fits into two lines without overflow
  let fontSize = Math.max(startFontSize, minFontSize);
  // Leave a small padding inside the box for the line chip
  const horizontalPaddingPx = 8; // 4px left + 4px right inside the chip
  const availablePx = Math.max(10, boxWidthPx - horizontalPaddingPx);

  for (let i = 0; i < 10; i++) {
    const approxCharWidth = fontSize * 0.6; // heuristic
    const maxChars = Math.max(6, Math.floor(availablePx / approxCharWidth));
    // If any single token is longer than maxChars, shrink font and retry so we don't split mid-word
    const longestToken = words.reduce((m, w) => Math.max(m, w.length), 0);
    if (longestToken > maxChars && fontSize > minFontSize) {
      fontSize = Math.max(minFontSize, fontSize * 0.92);
      continue;
    }
  let [l1, l2] = wrapTwo(maxChars);
  const overflow = (l2.endsWith('…') && l2.length > maxChars) || (!l1 && !!l2);
    // Also consider raw length check for safety
    const fits = l1.length <= maxChars && (!overflow && l2.length <= maxChars);
    if (fits) {
      // Prevent a lone ellipsis on second line by moving it to the first line
      if (l2.trim() === '…' || l2.trim() === '...') {
        l1 = (l1.replace(/…+$/,'')).trimEnd() + '…';
        l2 = '';
      }
      return { lines: [l1 || '', l2 || ''], fontSize };
    }
    fontSize = Math.max(minFontSize, fontSize * 0.92);
    if (fontSize === minFontSize) {
      // Final attempt at min font: recompute and accept with potential ellipsis
      const finalCharWidth = fontSize * 0.6;
      const finalMax = Math.max(6, Math.floor(availablePx / finalCharWidth));
  let [fl1, fl2] = wrapTwo(finalMax);
  if (!fl1 && fl2) { fl1 = fl2; fl2 = ''; }
  if (fl1.length > finalMax) fl1 = fl1.slice(0, Math.max(1, finalMax - 1)) + '…';
      if (fl2.length > finalMax) fl2 = fl2.slice(0, Math.max(1, finalMax - 1)) + '…';
      // Avoid rendering a solitary ellipsis line
      if (fl2.trim() === '…' || fl2.trim() === '...') {
        fl1 = (fl1.replace(/…+$/,'')).trimEnd() + '…';
        fl2 = '';
      }
      return { lines: [fl1 || '', fl2 || ''], fontSize };
    }
  }
  // Fallback (should rarely happen)
  return { lines: [text, ''], fontSize };
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

  // Detect Safari (exclude Chrome/Chromium/Edge). Helps decide foreignObject fallback.
  const isSafari = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /Safari\//.test(ua) && !/(Chrome|Chromium|Edg)\//.test(ua);
  }, []);

  return (
    <g>
      {sectors.map((s, i) => {
        const angle = s.angle;
  // Place text above icon for top and near-top sectors (12, 2, and 10 o'clock)
  const textAbove = angle === 0 || angle === 60 || angle === 300; // Körper & Bewegung, Ernährung & Genuss, Umwelt & Soziales
  // Box width for icon + label stack (axis-aligned), adapt to canvas
  const canvasSize = center * 2;
  const boxWidth = Math.round(Math.min(iconSize * 3.1, canvasSize - 8)); // wider base to help text fit

  // Two-line layout with dynamic downscaling
  const minFont = 8; // slightly smaller for ultra-small screens
  const layout = computeTwoLineLayout(s.label, boxWidth, textConfig.fontSize, minFont);
  const textLines: [string, string] = layout.lines;

  // Calculate dynamic box height from content (exactly two lines)
  const iconBlock = Math.round(iconSize * 0.9);
  const marginTop = Math.max(4, Math.round(layout.fontSize * 0.3));
  const lineHeightPx = Math.round(layout.fontSize * 1.1);
  const linesBlock = 2 * lineHeightPx + 1; // 1px gap between the two lines
  const paddingBlock = 8; // 4px top + 4px bottom from container padding
  const boxHeight = Math.round(iconBlock + marginTop + linesBlock + paddingBlock);

        // Compute icon center radius independent of label text (decouple guideline from text box)
  const iconBadgeRadius = Math.round(iconSize * 0.9) / 2;
  const minIconCenterRadius = avoidRadius + safetyGap + iconBadgeRadius;
  const baseIconCenterRadius = Math.max(radius, minIconCenterRadius);
  // Apply additional 20% on top (total 36%): shrinkFactor = 0.64
  const shrinkFactor = 0.64; // cumulative
  const innerStart = avoidRadius; // same base as guideline inner
  const iconCenterRadius = innerStart + shrinkFactor * (baseIconCenterRadius - innerStart);
        // Icon center position where the guideline should end (at icon edge)
        const pos = polarToCartesian(center, center, iconCenterRadius, angle);
        
  // Compute top-left so that the icon center aligns with `pos` and text sits above/below without affecting the guideline
  const contentPadding = 4; // matches container padding
  const iconCenterOffsetY = textAbove
    ? contentPadding + (2 * lineHeightPx + 1) + Math.max(4, Math.round(layout.fontSize * 0.3)) + iconBlock / 2
    : contentPadding + iconBlock / 2;

  const fxUnclamped = pos.x - boxWidth / 2;
  const fyUnclamped = pos.y - iconCenterOffsetY;
  // Round coordinates to avoid sub-pixel issues in Safari/Firefox within foreignObject
  const fx = Math.round(fxUnclamped);
  const fy = Math.round(fyUnclamped);

  return (
          isSafari ? (
            // Safari fallback: render labels as pure SVG to avoid foreignObject glitches
            <g key={i} opacity={showLabels ? 1 : 0} style={{ transition: 'opacity 260ms ease-out' }}>
              {/* Icon circle */}
              <circle
                cx={fx + boxWidth / 2}
                cy={fy + iconCenterOffsetY}
                r={Math.round(iconSize * 0.9) / 2}
                fill="#F6E2CA"
                stroke="rgba(61, 82, 65, 0.1)"
                strokeWidth={1}
              />
              {/* Icon image */}
              <image
                href={s.icon}
                x={fx + boxWidth / 2 - Math.round(iconSize * 0.6) / 2}
                y={fy + iconCenterOffsetY - Math.round(iconSize * 0.6) / 2}
                width={Math.round(iconSize * 0.6)}
                height={Math.round(iconSize * 0.6)}
                preserveAspectRatio="xMidYMid meet"
              />
              {/* Text chips */}
              {(() => {
                const padX = 3; // matches '1px 3px' used in HTML chip
                const chipH = lineHeightPx; // approximate
                const measure = (line: string) => Math.max(10, Math.round(line.length * layout.fontSize * 0.6) + padX * 2);
                const w1 = measure(textLines[0]);
                const w2 = measure(textLines[1]);
                // Top-left x of centered chips
                const x1 = fx + Math.round((boxWidth - w1) / 2);
                const x2 = fx + Math.round((boxWidth - w2) / 2);
                if (textAbove) {
                  const topY = fy + 4; // content padding
                  const y1 = topY;
                  const y2 = topY + chipH + 1; // 1px gap
                  return (
                    <g>
                      <rect x={x1} y={y1} width={w1} height={chipH} rx={4} ry={4} fill="#FFFFFF" />
                      <text x={fx + boxWidth / 2} y={y1 + chipH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={layout.fontSize} fontFamily="system-ui, -apple-system, sans-serif" fill="#000">{textLines[0]}</text>
                      <rect x={x2} y={y2} width={w2} height={chipH} rx={4} ry={4} fill="#FFFFFF" />
                      <text x={fx + boxWidth / 2} y={y2 + chipH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={layout.fontSize} fontFamily="system-ui, -apple-system, sans-serif" fill="#000">{textLines[1]}</text>
                    </g>
                  );
                }
                // Below icon
                const startY = fy + 4 + Math.round(iconSize * 0.9) + Math.max(4, Math.round(layout.fontSize * 0.3));
                const y1 = startY;
                const y2 = startY + chipH + 1;
                return (
                  <g>
                    <rect x={x1} y={y1} width={w1} height={chipH} rx={4} ry={4} fill="#FFFFFF" />
                    <text x={fx + boxWidth / 2} y={y1 + chipH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={layout.fontSize} fontFamily="system-ui, -apple-system, sans-serif" fill="#000">{textLines[0]}</text>
                    <rect x={x2} y={y2} width={w2} height={chipH} rx={4} ry={4} fill="#FFFFFF" />
                    <text x={fx + boxWidth / 2} y={y2 + chipH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={layout.fontSize} fontFamily="system-ui, -apple-system, sans-serif" fill="#000">{textLines[1]}</text>
                  </g>
                );
              })()}
            </g>
          ) : (
            <foreignObject
              key={i}
              x={fx}
              y={fy}
              width={boxWidth}
              height={boxHeight}
              requiredExtensions="http://www.w3.org/1999/xhtml"
              style={{
                opacity: showLabels ? 1 : 0,
                transition: 'opacity 260ms ease-out',
                overflow: 'hidden',
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
                fontSize: layout.fontSize,
                textAlign: 'center',
                lineHeight: 1.1,
                color: '#000',
                padding: '4px',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: '500',
                // Improve cross-browser consistency inside foreignObject
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                background: 'transparent',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
              }}>
                {/* Conditionally render text above icon for top sector */}
                {textAbove && (
                  <div style={{
                    marginBottom: Math.max(4, Math.round(layout.fontSize * 0.3)),
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1px',
                  }}>
                    {[textLines[0], textLines[1]].map((line, lineIndex) => (
                      <div key={lineIndex} style={{
                        width: '100%',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        hyphens: 'auto',
                        WebkitHyphens: 'auto',
                        textRendering: 'optimizeLegibility',
                        fontSize: layout.fontSize,
                        lineHeight: 1.1,
                        background: 'transparent',
                        borderRadius: 0,
                        display: 'block',
                      }}>
                        <span style={{
                          background: '#FFFFFF',
                          padding: '1px 3px',
                          borderRadius: 4,
                          boxShadow: 'none',
                          border: 'none',
                          color: 'inherit',
                        }}>{line}</span>
                      </div>
                    ))}
                  </div>
                )}

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

                {/* Text below icon for non-top sectors */}
                {!textAbove && (
                  <div style={{
                    marginTop: Math.max(4, Math.round(layout.fontSize * 0.3)),
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1px',
                  }}>
                    {[textLines[0], textLines[1]].map((line, lineIndex) => (
                      <div key={lineIndex} style={{
                        width: '100%',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        hyphens: 'auto',
                        WebkitHyphens: 'auto',
                        textRendering: 'optimizeLegibility',
                        fontSize: layout.fontSize,
                        lineHeight: 1.1,
                        background: 'transparent',
                        borderRadius: 0,
                        display: 'block',
                      }}>
                        <span style={{
                          background: '#FFFFFF',
                          padding: '1px 3px',
                          borderRadius: 4,
                          boxShadow: 'none',
                          border: 'none',
                          color: 'inherit',
                        }}>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </foreignObject>
          )
        );
      })}
    </g>
  );
}
