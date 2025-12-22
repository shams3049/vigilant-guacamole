import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { polarToCartesian, describeArc, type Sector, type RadarChartColors, DEFAULT_RADAR_COLORS } from '../utils';

function getStrengthColor(strength: number, max: number, colors: RadarChartColors): string {
  if (strength >= 9) return colors.full;       // dark green (9-10)
  if (strength >= 7) return colors.medium;     // light green (7-8)
  if (strength >= 4) return colors.low;        // yellow (4-6)
  return colors.lowest;                        // red (0-3)
}

export default function RadarLayer({
  values,
  center,
  max,
  radius,
  barWidth,
  gap,
  sectors,
  colors = DEFAULT_RADAR_COLORS,
  onBarsComplete,
  onProgress,
}: {
  values: number[];
  center: number;
  max: number;
  radius: number;
  barWidth: number;
  gap: number;
  sectors: Sector[];
  colors?: RadarChartColors;
  onBarsComplete?: () => void; // New: callback to notify when outward animation completes
  onProgress?: (visibleR: number) => void;
}) {
  // Visible bars count (radius index) shown so far, same for all sectors
  const [visibleR, setVisibleR] = useState(0);

  // Refs to hold latest callbacks without retriggering effects
  const onProgressRef = useRef(onProgress);
  const onBarsCompleteRef = useRef(onBarsComplete);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
  useEffect(() => { onBarsCompleteRef.current = onBarsComplete; }, [onBarsComplete]);

  // Memoize sector configurations (angles/colors/paths)
  const sectorConfigs = useMemo(() => {
    const sectorArcAngle = 60; // Each sector covers 60 degrees (360/6)
    
    return values.map((strength, sectorIndex) => {
      const baseAngle = sectors[sectorIndex].angle;
      const sectorColor = getStrengthColor(strength, max, colors);
      
      return {
        strength,
        baseAngle,
        sectorColor,
        bars: Array.from({ length: max }, (_, barIndex) => {
          const r = radius + barIndex * (barWidth + gap);
          const sectorGapPx = barWidth * 0.3;
          const sectorGap = (sectorGapPx / r) * (180 / Math.PI);
          const arcAngle = sectorArcAngle - sectorGap;
          const startAngle = baseAngle - arcAngle / 2;
          const endAngle = baseAngle + arcAngle / 2;
          const active = barIndex + 1 <= strength;
          
          return {
            r,
            startAngle,
            endAngle,
            active,
            path: describeArc(center, center, r, startAngle, endAngle),
            color: active ? sectorColor : colors.inactive,
          };
        }),
      };
    });
  }, [values, sectors, max, radius, barWidth, gap, center, colors]);

  // Drive a single outward wave counter shared by all sectors
  useEffect(() => {
    setVisibleR(0);

    const totalSteps = max; // one step per ring
    const stepMs = 60; // speed per ring
    let step = 0;

    const id = window.setInterval(() => {
      step += 1;
      setVisibleR((prev) => {
        const next = Math.min(prev + 1, totalSteps);
        onProgressRef.current?.(next);
        return next;
      });
      if (step >= totalSteps) {
        window.clearInterval(id);
        // Slight delay to allow final CSS transitions to settle
        window.setTimeout(() => onBarsCompleteRef.current?.(), 120);
      }
    }, stepMs);

    return () => window.clearInterval(id);
  }, [max, values.join(',' )]);

  // Render bars with visibility controlled by ring index
  const renderedPaths = useMemo(() => {
    return sectorConfigs.flatMap((sectorConfig, sectorIndex) =>
      sectorConfig.bars.map((bar, barIndex) => {
        const isVisible = barIndex < visibleR; // outward growth
        return (
          <path
            key={`${sectorIndex}-${barIndex}`}
            d={bar.path}
            stroke={bar.color}
            strokeWidth={barWidth}
            fill="none"
            strokeLinecap="butt"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0.7)',
              transformOrigin: `${center}px ${center}px`,
              transition: 'opacity 240ms ease-out, transform 240ms cubic-bezier(0.35,1.8,0.6,1)',
              willChange: isVisible ? 'auto' : 'opacity, transform',
            }}
          />
        );
      })
    );
  }, [sectorConfigs, visibleR, barWidth, center]);

  // Optional debug overlay: when `debug_colors=1` is present in the URL,
  // render a small, non-intrusive text list in the top-left of the SVG
  // showing sector index, strength and the chosen color. This helps
  // validate color thresholds in-browser without additional tooling.
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const showDebug = params?.get('debug_colors') === '1';
  return (
    <g>
      {renderedPaths}
    </g>
  );
}
