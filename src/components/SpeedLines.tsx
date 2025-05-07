// src/components/SpeedLines.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { seededRandomFloat } from '../utils/randomUtils';

interface SpeedLineWebProps {
  id: string; // Unique key for React
  angle: number;
  startRadius: number;
  maxRadius: number;
  delaySeconds: number;
  lifeSpanSeconds: number;
  color: string;
  strokeWidth: number;
}

const SingleSpeedLine: React.FC<SpeedLineWebProps> = ({
  angle, startRadius, maxRadius, delaySeconds, lifeSpanSeconds, color, strokeWidth
}) => {
  const lineVariants = {
    hidden: {
      pathLength: 0, // Start with the line not drawn
      opacity: 0,
    },
    visible: {
      pathLength: 1, // Draw the full line
      opacity: [0, 1, 0.8, 0], // Fade in, stay, fade out
      transition: {
        delay: delaySeconds,
        pathLength: { duration: lifeSpanSeconds * 0.5, ease: "easeOut" }, // Draw in half lifespan
        opacity: { duration: lifeSpanSeconds, ease: "linear", times: [0, 0.1, 0.8, 1] },
      },
    },
  };

  const x1 = Math.cos(angle) * startRadius;
  const y1 = Math.sin(angle) * startRadius;
  const x2 = Math.cos(angle) * maxRadius;
  const y2 = Math.sin(angle) * maxRadius;

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
      variants={lineVariants}
      initial="hidden"
      animate="visible"
    />
  );
};

interface SpeedLinesSystemProps {
  count?: number;
  color?: string;
  strokeWidth?: number;
  maxRadiusMultiplier?: number; // Multiplier for shortest container dimension
  minStartRadiusPercent?: number; // Percentage of shortestDim
  maxStartRadiusPercent?: number; // Percentage of shortestDim
  minLifespanSeconds?: number;
  maxLifespanSeconds?: number;
  seed?: string | number;
  className?: string; // For Tailwind etc.
  style?: React.CSSProperties; // For direct styling
}

export const SpeedLines: React.FC<SpeedLinesSystemProps> = ({
  count = 30,
  color = 'rgba(255, 255, 255, 0.3)',
  strokeWidth = 1.2,
  maxRadiusMultiplier = 0.8,
  minStartRadiusPercent = 5,
  maxStartRadiusPercent = 25,
  minLifespanSeconds = 0.4,
  maxLifespanSeconds = 1.2,
  seed = 'web-speed-lines',
  className, style
}) => {
  const [containerSize, setContainerSize] = useState({ width: 300, height: 500 }); // Default, update with ref
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const shortestDim = Math.min(containerSize.width, containerSize.height);
  const maxRadiusActual = shortestDim * maxRadiusMultiplier;

  const memoizedSeed = useMemo(() => {
    let numSeed = 0;
    const seedStr = String(seed);
    for (let i = 0; i < seedStr.length; i++) {
      numSeed = (numSeed * 31 + seedStr.charCodeAt(i)) | 0;
    }
    return numSeed + count;
  }, [seed, count]);

  const lines = useMemo(() => {
    const lineArray: SpeedLineWebProps[] = [];
    // Spread out delays over average lifespan to create a continuous effect
    const averageLifespan = (minLifespanSeconds + maxLifespanSeconds) / 2;
    const totalDelayWindow = count * averageLifespan * 0.2; // Adjust 0.2 factor for density

    for (let i = 0; i < count; i++) {
      const lineSeed = String(memoizedSeed + i);
      const angle = seededRandomFloat(lineSeed + 'angle') * 2 * Math.PI;
      const startRadius = shortestDim * ( (minStartRadiusPercent + seededRandomFloat(lineSeed + 'sr') * (maxStartRadiusPercent - minStartRadiusPercent)) / 100 );
      const lifeSpan = minLifespanSeconds + seededRandomFloat(lineSeed + 'ls') * (maxLifespanSeconds - minLifespanSeconds);
      const delay = seededRandomFloat(lineSeed + 'delay') * totalDelayWindow;

      lineArray.push({
        id: `${memoizedSeed}-line-${i}`,
        angle,
        startRadius: startRadius,
        maxRadius: maxRadiusActual,
        delaySeconds: delay,
        lifeSpanSeconds: lifeSpan,
        color: color,
        strokeWidth: strokeWidth * (0.7 + seededRandomFloat(lineSeed + 'sw') * 0.6),
      });
    }
    return lineArray;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, memoizedSeed, color, strokeWidth, maxRadiusActual, shortestDim, minStartRadiusPercent, maxStartRadiusPercent, minLifespanSeconds, maxLifespanSeconds]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      {containerSize.width > 0 && containerSize.height > 0 && (
        <svg width="100%" height="100%" viewBox={`0 0 ${containerSize.width} ${containerSize.height}`} style={{ overflow: 'visible' }}>
          <g transform={`translate(${containerSize.width / 2}, ${containerSize.height / 2})`}>
            {lines.map((lineProps) => (
              <SingleSpeedLine key={lineProps.id} {...lineProps} />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
};