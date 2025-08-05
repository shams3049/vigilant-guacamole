import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
}: {
  values: number[];
  center: number;
  max: number;
  radius: number;
  barWidth: number;
  gap: number;
  sectors: Sector[];
}) {
  // Animation state: track which bars are visible (2D array)
  const [visible, setVisible] = useState(
    Array(values.length).fill(null).map(() => Array(max).fill(false))
  );

  // Memoize animation timing calculation
  const animationConfig = useMemo(() => {
    const baseDelay = 200; // Start after guidelines
    const staggerDelay = 40; // Reduced from 60ms for faster animation
    const sectorDelay = max * staggerDelay;
    
    return { baseDelay, staggerDelay, sectorDelay };
  }, [max]);

  // Memoize sector configurations
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
            animationDelay: (sectorIndex * max + barIndex) * animationConfig.staggerDelay + animationConfig.baseDelay,
          };
        }),
      };
    });
  }, [values, sectors, max, radius, barWidth, gap, center, animationConfig]);

  // Optimized animation effect with cleanup
  useEffect(() => {
    const timeouts: number[] = [];
    
    // Reset visibility
    setVisible(Array(values.length).fill(null).map(() => Array(max).fill(false)));
    
    // Create all animations at once to reduce state updates
    sectorConfigs.forEach((sectorConfig, sectorIndex) => {
      sectorConfig.bars.forEach((_, barIndex) => {
        const timeout = setTimeout(() => {
          setVisible(prev => {
            const next = prev.map(arr => [...arr]);
            next[sectorIndex][barIndex] = true;
            return next;
          });
        }, sectorConfig.bars[barIndex].animationDelay);
        
        timeouts.push(timeout);
      });
    });

    // Cleanup function
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [sectorConfigs, values.length, max]);

  // Memoize rendered paths to avoid recalculation
  const renderedPaths = useMemo(() => {
    return sectorConfigs.flatMap((sectorConfig, sectorIndex) =>
      sectorConfig.bars.map((bar, barIndex) => (
        <path
          key={`${sectorIndex}-${barIndex}`}
          d={bar.path}
          stroke={bar.color}
          strokeWidth={barWidth}
          fill="none"
          strokeLinecap="butt"
          style={{
            opacity: visible[sectorIndex]?.[barIndex] ? 1 : 0,
            transform: visible[sectorIndex]?.[barIndex] ? 'scale(1)' : 'scale(0.7)',
            transformOrigin: `${center}px ${center}px`,
            transition: 'opacity 0.3s ease-out, transform 0.3s cubic-bezier(0.4,2,0.6,1)',
            willChange: visible[sectorIndex]?.[barIndex] ? 'auto' : 'opacity, transform',
          }}
        />
      ))
    );
  }, [sectorConfigs, visible, barWidth, center]);

  return <g>{renderedPaths}</g>;
}
