export interface Sector {
  label: string;
  icon: string;
  angle: number;
}

// Cached calculations to avoid recalculation
const calculationCache = new Map<string, any>();

// Convert polar coordinates to cartesian coordinates for SVG positioning
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number
) {
  // Create cache key for expensive calculations
  const cacheKey = `polar_${cx}_${cy}_${r}_${angleInDegrees}`;
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey);
  }
  
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  const result = {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
  
  // Cache result for reuse
  calculationCache.set(cacheKey, result);
  
  // Limit cache size to prevent memory leaks
  if (calculationCache.size > 1000) {
    const firstKey = calculationCache.keys().next().value;
    if (firstKey) {
      calculationCache.delete(firstKey);
    }
  }
  
  return result;
}

// Generate an SVG arc path string for a circular segment
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  // Create cache key for arc calculations
  const cacheKey = `arc_${cx}_${cy}_${r}_${startAngle}_${endAngle}`;
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey);
  }
  
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  const result = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  
  // Cache result
  calculationCache.set(cacheKey, result);
  
  // Limit cache size
  if (calculationCache.size > 1000) {
    const firstKey = calculationCache.keys().next().value;
    if (firstKey) {
      calculationCache.delete(firstKey);
    }
  }
  
  return result;
}

// Performance monitoring utilities
export const perfUtils = {
  // Measure rendering performance
  measureRender: (name: string, fn: () => void) => {
    if (typeof performance !== 'undefined') {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    } else {
      fn();
    }
  },

  // Throttle function calls
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Debounce function calls
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: number | null = null;
    return function(this: any, ...args: Parameters<T>) {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  // Clear performance cache
  clearCache: () => {
    calculationCache.clear();
  },

  // Get cache size for monitoring
  getCacheSize: () => calculationCache.size,
};

// Responsive design utilities
export const responsiveUtils = {
  // Detect if device supports touch
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get viewport dimensions
  getViewportSize: () => {
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    };
  },

  // Detect reduced motion preference
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get device pixel ratio for high-DPI displays
  getPixelRatio: (): number => {
    return window.devicePixelRatio || 1;
  },

  // Check if device is in landscape mode
  isLandscape: (): boolean => {
    return window.innerWidth > window.innerHeight;
  },
};

// Animation utilities
export const animationUtils = {
  // Easing functions
  easing: {
    easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number): number => t * (2 - t),
    easeIn: (t: number): number => t * t,
    elastic: (t: number): number => {
      if (t === 0 || t === 1) return t;
      const p = 0.3;
      const s = p / 4;
      return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
    },
  },

  // Request animation frame with fallback
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    return window.requestAnimationFrame 
           ? window.requestAnimationFrame(callback)
           : window.setTimeout(callback, 1000 / 60);
  },

  // Cancel animation frame
  cancelAnimationFrame: (id: number): void => {
    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      window.clearTimeout(id);
    }
  },
};

// Error boundary utilities
export const errorUtils = {
  // Safe execution wrapper
  safeExecute: <T>(fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch (error) {
      console.error('Safe execution failed:', error);
      return fallback;
    }
  },

  // Log performance warnings
  logPerformanceWarning: (message: string, threshold: number, actual: number) => {
    if (actual > threshold) {
      console.warn(`Performance warning: ${message}. Expected: ${threshold}ms, Actual: ${actual}ms`);
    }
  },
};
