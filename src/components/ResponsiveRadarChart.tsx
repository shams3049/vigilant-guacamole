import React, { useRef, useState, useLayoutEffect } from 'react';
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

export default function ResponsiveRadarChart({ values }: { values: number[] }) {
  // Reference to the chart container for responsive sizing
  const containerRef = useRef<HTMLDivElement>(null);
  // State to store the current chart size
  const [size, setSize] = useState(300);
  // State to track wobble animation
  const [isWobbling, setIsWobbling] = useState(false);

  useLayoutEffect(() => {
    // Update chart size based on container dimensions
    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setSize(Math.min(rect.width, rect.height));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Calculate geometry and layout values for the chart
  const center = size / 2;
  const max = 9;
  const radius = size * 0.095;
  const barWidth = size * 0.021;
  // Reduce the gap between bars for a tighter look
  const gap = size * 0.004;
  const iconRadius = size * 0.48;
  const guidelineInner = radius + max * (barWidth + gap);
  const guidelineOuter = iconRadius - 12;
  const iconSize = Math.min(size * 0.08, 36);
  const fontSize = size * 0.024;
  // Calculate the average value and its percentage
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const avgPercent = Math.round((avg / max) * 100);
  
  // Find the sector with the lowest score for the navigation pointer
  const minValueIndex = values.indexOf(Math.min(...values));
  const pointerAngle = SECTORS[minValueIndex].angle;

  // Handle arrow click for wobble animation
  const handleArrowClick = () => {
    setIsWobbling(true);
    // Reset wobble after animation completes
    setTimeout(() => setIsWobbling(false), 2500);
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
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
        
        {/* Center circle and navigation pointer */}
        <circle cx={center} cy={center} r={size * 0.07} fill="#F6E2CA" stroke="#3D5241" strokeWidth="2" />
        
        {/* Navigation pointer pointing to the lowest scoring section */}
        <g transform={`translate(${center}, ${center})`}>
          {/* Animated pointer with smooth transition - centered at origin */}
          <g 
            style={{ 
              transformOrigin: '0 0', 
              transition: isWobbling ? 'none' : 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }} 
            transform={`rotate(${pointerAngle})`}
            onClick={handleArrowClick}
          >
            
            {/* Rotational wobble animation container */}
            <g 
              style={{
                transformOrigin: '0 0',
                animation: isWobbling ? 'wobbleRotation 2.5s ease-out' : 'none'
              }}
            >
            
            {/* Main pointer body with 3D effect - centered arrow */}
            <polygon
              points={`0,-${size * 0.055} -${size * 0.024},-${size * 0.007} -${size * 0.011},${size * 0.020} ${size * 0.011},${size * 0.020} ${size * 0.024},-${size * 0.007}`}
              fill="url(#pointerGradient)"
              stroke="#AA4444"
              strokeWidth="0.5"
            />
            
            {/* Indented base edges for 3D effect */}
            <polygon
              points={`-${size * 0.011},${size * 0.020} -${size * 0.0055},${size * 0.030} ${size * 0.0055},${size * 0.030} ${size * 0.011},${size * 0.020}`}
              fill="#AA4444"
              stroke="#884444"
              strokeWidth="0.5"
            />
            
            {/* Center pivot circle with gradient */}
            <circle cx="0" cy="0" r={size * 0.013} fill="url(#baseGradient)" stroke="#AA4444" strokeWidth="0.5" />
            
            {/* Highlight on the pointer tip */}
            <polygon
              points={`0,-${size * 0.055} -${size * 0.008},-${size * 0.034} ${size * 0.008},-${size * 0.034}`}
              fill="#FFAAAA"
              opacity="0.8"
            />
            
            {/* Subtle pulsing animation */}
            <circle cx="0" cy="0" r={size * 0.012} fill="#FF6B6B" opacity="0.3">
              <animate attributeName="r" values={`${size * 0.012};${size * 0.016};${size * 0.012}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            
            </g>
          </g>
        </g>

        {/* Render radar bars for each sector */}
        <RadarLayer
          values={values}
          center={center}
          max={max}
          radius={radius}
          barWidth={barWidth}
          gap={gap}
          sectors={SECTORS}
        />

        {/* Render guidelines between sectors */}
        <GuideLinesLayer
          sectors={SECTORS}
          center={center}
          innerRadius={guidelineInner}
          outerRadius={guidelineOuter}
          iconSize={iconSize} // Pass iconSize for guideline adjustment
        />

        {/* Render icons and labels for each sector */}
        <IconLabelLayer
          sectors={SECTORS}
          center={center}
          radius={iconRadius}
          iconSize={iconSize}
          fontSize={fontSize}
        />
      </svg>
    </div>
  );
}
