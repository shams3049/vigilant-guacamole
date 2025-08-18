import React, { useRef, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import RadarLayer from './RadarLayer';
import GuideLinesLayer from './GuideLinesLayer';
import IconLabelLayer from './IconLabelLayer';
import type { Sector } from '../utils';

// Define the radar chart sectors with their labels, icons, and angles
// Starting from 0° (which becomes 12 o'clock after polarToCartesian offset) and proceeding clockwise in 60° increments
const SECTORS: Sector[] = [
  { label: 'Körper & Bewegung', icon: '/assets/bewegung.svg', angle: 0 },     // 12 o'clock (0° - 90° = -90° = 12 o'clock)
  { label: 'Ernährung & Genuss', icon: '/assets/ernaehrung_genuss.svg', angle: 60 },   // 2 o'clock
  { label: 'Stress & Erholung', icon: '/assets/stress_erholung.svg', angle: 120 },   // 4 o'clock
  { label: 'Geist & Emotionen', icon: '/assets/geist_emotion.svg', angle: 180 },     // 6 o'clock
  { label: 'Lebenssinn & -qualität', icon: '/assets/lebenssinn_qualitaet.svg', angle: 240 }, // 8 o'clock
  { label: 'Umwelt & Soziales', icon: '/assets/umwelt_soziales.svg', angle: 300 },  // 10 o'clock
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
  const [showLabels, setShowLabels] = useState(false);

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
  const max = 10;

    // Compute the outer edge radius of the outermost bar
    const outermostRingCenterRadius = config.radius + (max - 1) * (config.barWidth + config.gap);
    const guidelineInner = outermostRingCenterRadius + config.barWidth / 2; // touch outer bar edge

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

  // When values change, restart label reveal
  useLayoutEffect(() => {
    setShowLabels(false);
  }, [values]);

  // Stable callbacks to avoid retriggering child animations
  const handleProgress = useCallback((visibleR: number) => {
    if (visibleR >= calculations.max) setShowLabels(true);
  }, [calculations.max]);

  const handleBarsComplete = useCallback(() => {
    setShowLabels(true);
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
        <defs>
          {/* Subtle, performance-friendly shadows */}
          <filter id="centerShadow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000" floodOpacity="0.10" />
          </filter>
          <filter id="barShadow" x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.5" floodColor="#000" floodOpacity="0.12" />
          </filter>
          <filter id="guideShadow" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="0.3" stdDeviation="0.3" floodColor="#000" floodOpacity="0.10" />
          </filter>
          <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="0.6" stdDeviation="0.6" floodColor="#000" floodOpacity="0.14" />
          </filter>
        </defs>
        {/* Center circle with responsive sizing */}
        <circle 
          cx={calculations.center} 
          cy={calculations.center} 
          r={config.centerRadius} 
          fill="#F6E2CA" 
          stroke="#3D5241" 
          strokeWidth="2"
          filter="url(#centerShadow)"
        />
        
        {/* Navigation pointer pointing to the lowest scoring section */}
        <g transform={`translate(${calculations.center}, ${calculations.center})`}>
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
            <g 
              style={{
                transformOrigin: '0 0',
                animation: isWobbling ? 'wobbleRotation 2.5s ease-out' : 'none'
              }}
              filter="url(#pointerShadow)"
            >
              {(() => {
                // Ensure the icon fully fits inside the center circle with ~1% margin to the border.
                // We inscribe the icon's axis-aligned bounding box into a circle of radius (centerRadius * 0.99).
                const marginRatio = 0.01; // 1% space to the border
                const innerRadius = Math.max(0, config.centerRadius * (1 - marginRatio));
                const aspect = 32 / 48; // width/height from SVG viewBox
                // For a rectangle centered at origin, half-diagonal must be <= innerRadius.
                // halfDiag = 0.5 * sqrt(w^2 + h^2) with w = aspect * h
                // => h <= 2*innerRadius / sqrt(aspect^2 + 1)
                const height = (2 * innerRadius) / Math.sqrt(aspect * aspect + 1);
                const width = aspect * height;
                // Center the image at the origin so it remains inside the middle circle while rotating
                const x = -width / 2;
                const y = -height / 2;
                return (
                  <image
                    href="/assets/naviationicon.svg"
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    preserveAspectRatio="xMidYMid meet"
                  />
                );
              })()}
            </g>
          </g>
        </g>

        {/* Render radar bars for each sector */}
        <g filter="url(#barShadow)">
          <RadarLayer
            values={values}
            center={calculations.center}
            max={calculations.max}
            radius={config.radius}
            barWidth={config.barWidth}
            gap={config.gap}
            sectors={SECTORS}
            onProgress={handleProgress}
            onBarsComplete={handleBarsComplete}
          />
        </g>

        {/* Render guidelines between sectors */}
        <g filter="url(#guideShadow)">
          <GuideLinesLayer
            sectors={SECTORS}
            center={calculations.center}
            innerRadius={calculations.guidelineInner}
            outerRadius={calculations.guidelineOuter}
            iconSize={config.iconSize}
            fontSize={config.fontSize}
            labelRadius={config.iconRadius}
            avoidRadius={calculations.guidelineInner}
            safetyGap={12}
          />
        </g>

        {/* Render icons and labels for each sector */}
        <IconLabelLayer
          sectors={SECTORS}
          center={calculations.center}
          radius={config.iconRadius}
          iconSize={config.iconSize}
          fontSize={config.fontSize}
          avoidRadius={calculations.guidelineInner}
          safetyGap={12}
          showLabels={showLabels}
        />
      </svg>
    </div>
  );
}
