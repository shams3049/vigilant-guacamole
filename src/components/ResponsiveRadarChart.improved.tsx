import React, { useRef, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import RadarLayer from './RadarLayer';
import GuideLinesLayer from './GuideLinesLayer';
import IconLabelLayer from './IconLabelLayer';
import type { Sector } from '../utils';

// Define the radar chart sectors with their labels, icons, and angles
const SECTORS: Sector[] = [
  { label: 'Bewegung', icon: '/assets/bewegung.svg', angle: -90 },
  { label: 'Ernährung & Genuss', icon: '/assets/ernaehrung_genuss.svg', angle: -30 },
  { label: 'Stress & Erholung', icon: '/assets/stress_erholung.svg', angle: 30 },
  { label: 'Geist & Emotion', icon: '/assets/geist_emotion.svg', angle: 90 },
  { label: 'Lebenssinn & -qualität', icon: '/assets/lebenssinn_qualitaet.svg', angle: 150 },
  { label: 'Umwelt & Soziales', icon: '/assets/umwelt_soziales.svg', angle: 210 },
];

// Debounce utility function for resize events
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): T {
  const timeoutRef = useRef<number | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
}

// Responsive breakpoints
const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1200,
} as const;

function getResponsiveConfig(size: number) {
  const baseSize = Math.max(size, BREAKPOINTS.xs);
  
  // Scale factors based on screen size
  const scaleFactor = baseSize < BREAKPOINTS.sm ? 0.8 : 
                     baseSize < BREAKPOINTS.md ? 0.9 : 1.0;
  
  return {
    radius: baseSize * 0.095 * scaleFactor,
    barWidth: Math.max(baseSize * 0.021 * scaleFactor, 2), // Minimum 2px bar width
    gap: baseSize * 0.004 * scaleFactor,
    iconRadius: baseSize * 0.48 * scaleFactor,
    iconSize: Math.min(Math.max(baseSize * 0.08 * scaleFactor, 24), 48), // Min 24px, max 48px
    fontSize: Math.max(baseSize * 0.024 * scaleFactor, 10), // Minimum 10px font
    centerRadius: Math.max(baseSize * 0.07 * scaleFactor, 15), // Minimum 15px center
    pointerSize: {
      length: baseSize * 0.055 * scaleFactor,
      width: baseSize * 0.024 * scaleFactor,
      base: baseSize * 0.020 * scaleFactor,
    }
  };
}

export default function ResponsiveRadarChart({ values }: { values: number[] }) {
  // Reference to the chart container for responsive sizing
  const containerRef = useRef<HTMLDivElement>(null);
  // State to store the current chart size
  const [size, setSize] = useState(300);
  // State to track wobble animation
  const [isWobbling, setIsWobbling] = useState(false);
  // Track if component is mounted to prevent memory leaks
  const isMountedRef = useRef(true);

  // Debounced resize handler to improve performance
  const debouncedResize = useDebounce(() => {
    if (!isMountedRef.current) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const newSize = Math.min(rect.width, rect.height);
      // Only update if size changed significantly to avoid unnecessary renders
      if (Math.abs(newSize - size) > 5) {
        setSize(newSize);
      }
    }
  }, 100);

  useLayoutEffect(() => {
    isMountedRef.current = true;
    debouncedResize();
    
    const handleResize = () => debouncedResize();
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [debouncedResize]);

  // Memoized calculations to prevent unnecessary recalculations
  const config = useMemo(() => getResponsiveConfig(size), [size]);
  
  const calculations = useMemo(() => {
    const center = size / 2;
    const max = 9;
    const guidelineInner = config.radius + max * (config.barWidth + config.gap);
    const guidelineOuter = config.iconRadius - 12;
    
    // Calculate the average value and its percentage
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const avgPercent = Math.round((avg / max) * 100);
    
    // Find the sector with the lowest score for the navigation pointer
    const minValueIndex = values.indexOf(Math.min(...values));
    const pointerAngle = SECTORS[minValueIndex].angle;

    return {
      center,
      max,
      guidelineInner,
      guidelineOuter,
      avg,
      avgPercent,
      pointerAngle,
    };
  }, [size, values, config]);

  // Handle arrow click for wobble animation with cleanup
  const handleArrowClick = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsWobbling(true);
    // Reset wobble after animation completes with cleanup check
    setTimeout(() => {
      if (isMountedRef.current) {
        setIsWobbling(false);
      }
    }, 2500);
  }, []);

  // Cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center min-h-0">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${size} ${size}`} 
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: '100vh', maxWidth: '100vw' }}
      >
        {/* Define gradients for the pointer */}
        <defs>
          <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF8A8A" />
            <stop offset="50%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#CC5555" />
          </linearGradient>
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8A8A" />
            <stop offset="100%" stopColor="#CC5555" />
          </linearGradient>
        </defs>
        
        {/* Center circle with responsive sizing */}
        <circle 
          cx={calculations.center} 
          cy={calculations.center} 
          r={config.centerRadius} 
          fill="#F6E2CA" 
          stroke="#3D5241" 
          strokeWidth="2" 
        />
        
        {/* Navigation pointer pointing to the lowest scoring section */}
        <g transform={`translate(${calculations.center}, ${calculations.center})`}>
          {/* Animated pointer with smooth transition */}
          <g 
            style={{ 
              transformOrigin: '0 0', 
              transition: isWobbling ? 'none' : 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }} 
            transform={`rotate(${calculations.pointerAngle})`}
            onClick={handleArrowClick}
            role="button"
            tabIndex={0}
            aria-label={`Navigation pointer pointing to lowest score: ${SECTORS[values.indexOf(Math.min(...values))].label}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleArrowClick();
              }
            }}
          >
            {/* Rotational wobble animation container */}
            <g 
              style={{
                transformOrigin: '0 0',
                animation: isWobbling ? 'wobbleRotation 2.5s ease-out' : 'none'
              }}
            >
              {/* Main pointer body with responsive sizing */}
              <polygon
                points={`0,-${config.pointerSize.length} -${config.pointerSize.width},-${config.pointerSize.length * 0.12} -${config.pointerSize.width * 0.45},${config.pointerSize.base} ${config.pointerSize.width * 0.45},${config.pointerSize.base} ${config.pointerSize.width},-${config.pointerSize.length * 0.12}`}
                fill="url(#pointerGradient)"
                stroke="#AA4444"
                strokeWidth="0.5"
              />
              
              {/* Indented base edges for 3D effect */}
              <polygon
                points={`-${config.pointerSize.width * 0.45},${config.pointerSize.base} -${config.pointerSize.width * 0.22},${config.pointerSize.base * 1.5} ${config.pointerSize.width * 0.22},${config.pointerSize.base * 1.5} ${config.pointerSize.width * 0.45},${config.pointerSize.base}`}
                fill="#AA4444"
                stroke="#884444"
                strokeWidth="0.5"
              />
              
              {/* Center pivot circle with gradient */}
              <circle 
                cx="0" 
                cy="0" 
                r={Math.max(size * 0.013, 4)} 
                fill="url(#baseGradient)" 
                stroke="#AA4444" 
                strokeWidth="0.5" 
              />
              
              {/* Highlight on the pointer tip */}
              <polygon
                points={`0,-${config.pointerSize.length} -${config.pointerSize.width * 0.33},-${config.pointerSize.length * 0.62} ${config.pointerSize.width * 0.33},-${config.pointerSize.length * 0.62}`}
                fill="#FFAAAA"
                opacity="0.8"
              />
              
              {/* Subtle pulsing animation with responsive sizing */}
              <circle cx="0" cy="0" r={Math.max(size * 0.012, 4)} fill="#FF6B6B" opacity="0.3">
                <animate 
                  attributeName="r" 
                  values={`${Math.max(size * 0.012, 4)};${Math.max(size * 0.016, 6)};${Math.max(size * 0.012, 4)}`} 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
        </g>

        {/* Render radar bars for each sector */}
        <RadarLayer
          values={values}
          center={calculations.center}
          max={calculations.max}
          radius={config.radius}
          barWidth={config.barWidth}
          gap={config.gap}
          sectors={SECTORS}
        />

        {/* Render guidelines between sectors */}
        <GuideLinesLayer
          sectors={SECTORS}
          center={calculations.center}
          innerRadius={calculations.guidelineInner}
          outerRadius={calculations.guidelineOuter}
          iconSize={config.iconSize}
        />

        {/* Render icons and labels for each sector */}
        <IconLabelLayer
          sectors={SECTORS}
          center={calculations.center}
          radius={config.iconRadius}
          iconSize={config.iconSize}
          fontSize={config.fontSize}
        />
      </svg>
    </div>
  );
}
