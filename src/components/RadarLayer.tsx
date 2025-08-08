import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
      const sectorColor = getStrengthColor(strength, max);
      
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
            color: active ? sectorColor : INACTIVE_COLOR,
          };
        }),
      };
    });
  }, [values, sectors, max, radius, barWidth, gap, center]);

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
              transition: 'opacity 220ms ease-out, transform 220ms cubic-bezier(0.4,2,0.6,1)',
              willChange: isVisible ? 'auto' : 'opacity, transform',
            }}
          />
        );
      })
    );
  }, [sectorConfigs, visibleR, barWidth, center]);

  return <g>{renderedPaths}</g>;
}
