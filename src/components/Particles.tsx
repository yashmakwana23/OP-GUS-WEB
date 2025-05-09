// src/components/Particles.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import { seededRandomFloat } from '../utils/randomUtils';

// ParticleData interface and interpolate function remain the same

interface ParticleData {
  id: number;
  x: number; y: number;
  size: number;
  opacity: number;
  color: string;
  glowColor: string;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  initialDelayFrames: number;
  flickerFactor: number;
  aspectRatio: number;
  elapsedFramesAfterDelay: number;
}

interface ParticleSystemProps {
  count?: number;
  systemSeed?: string | number;
  particleBaseColor?: string;
  glowOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
  particleSizeMin?: number;
  particleSizeMax?: number;
  driftAmountFactor?: number;
  upwardVelocityFactor?: number;
}

const interpolate = (
  input: number,
  inputRange: [number, ...number[]],
  outputRange: [number, ...number[]],
  options?: { extrapolateLeft?: 'clamp'; extrapolateRight?: 'clamp' }
): number => {
    const [inMin, ...inRestInput] = inputRange;
    let inMax = inRestInput.pop();
    if (inMax === undefined) inMax = inMin;

    const [outMin, ...outRestOutput] = outputRange;
    let outMax = outRestOutput.pop();
    if (outMax === undefined) outMax = outMin;

    if (input <= inMin) return options?.extrapolateLeft === 'clamp' ? outMin : outMin;
    if (input >= inMax) return options?.extrapolateRight === 'clamp' ? outMax : outMax;

    let i = 0;
    while (i < inputRange.length - 2 && input > inputRange[i + 1]) {
        i++;
    }
    const t = (input - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
    if (isNaN(t) || !isFinite(t)) return outputRange[i];
    return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
};


export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 50,
  systemSeed = 'web-particles',
  particleBaseColor,
  glowOpacity = 0.5,
  className, style,
  particleSizeMin = 2.5,
  particleSizeMax = 6.5,
  driftAmountFactor = 1,
  upwardVelocityFactor = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const animationFrameIdRef = useRef<number | undefined>(undefined); // Correctly initialized

  // Store canvas dimensions in refs to be accessible in createParticle and animate
  const canvasWidthRef = useRef(0);
  const canvasHeightRef = useRef(0);

  const memoizedSystemSeed = useMemo(() => {
    let numSeed = 0;
    const seedStr = String(systemSeed);
    for (let i = 0; i < seedStr.length; i++) {
      numSeed = (numSeed * 31 + seedStr.charCodeAt(i)) | 0;
    }
    return numSeed + count;
  }, [systemSeed, count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const createParticle = (index: number, isReset = false): ParticleData => {
      const particleIdSeed = memoizedSystemSeed + index + (isReset ? performance.now() : 0);
      
      let baseHue = 15 + seededRandomFloat(String(particleIdSeed + 4)) * 40;
      let baseSaturation = 95 + seededRandomFloat(String(particleIdSeed + 5)) * 5;
      let baseLightness = 60 + seededRandomFloat(String(particleIdSeed + 6)) * 15;

      if (particleBaseColor) {
        const match = particleBaseColor.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
        if (match) {
            baseHue = parseFloat(match[1]) + (seededRandomFloat(String(particleIdSeed + 'h_var')) * 20 - 10);
            baseSaturation = parseFloat(match[2]);
            baseLightness = parseFloat(match[3]);
        }
      }
      
      const pColor = `hsl(${baseHue % 360}, ${baseSaturation}%, ${baseLightness}%)`;
      const glowHue = baseHue + (seededRandomFloat(String(particleIdSeed + 7)) * 10 - 5);
      const pGlowColor = `hsla(${glowHue % 360}, ${baseSaturation}%, ${Math.min(100, baseLightness + 20)}%, ${glowOpacity})`;
      
      const sceneDurationApproximation = 300; // Frames
      const initialDelay = isReset ? 0 : seededRandomFloat(String(particleIdSeed + 3)) * (sceneDurationApproximation * 0.6);
      const maxLife = sceneDurationApproximation * (0.4 + seededRandomFloat(String(particleIdSeed + 8)) * 0.5);

      return {
        id: index,
        x: (seededRandomFloat(String(particleIdSeed)) * 1.1 - 0.05) * canvasWidthRef.current,
        y: canvasHeightRef.current * (isReset ? 1.05 : (0.4 + seededRandomFloat(String(particleIdSeed + 1)) * 0.8)),
        size: particleSizeMin + seededRandomFloat(String(particleIdSeed + 2)) * (particleSizeMax - particleSizeMin),
        opacity: 0, color: pColor, glowColor: pGlowColor,
        vx: (seededRandomFloat(String(particleIdSeed + 'vx')) * 2 - 1) * 0.3 * driftAmountFactor,
        vy: -(0.05 + seededRandomFloat(String(particleIdSeed + 'vy')) * 0.1) * upwardVelocityFactor,
        life: 0, maxLife: maxLife, initialDelayFrames: initialDelay,
        flickerFactor: 0.4 + seededRandomFloat(String(particleIdSeed + 'flicker')) * 0.6,
        aspectRatio: 1.2 + seededRandomFloat(String(particleIdSeed + 'aspect')) * 0.6,
        elapsedFramesAfterDelay: 0,
      };
    };
    
    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const newWidth = canvas.offsetWidth;
        const newHeight = canvas.offsetHeight;

        canvasWidthRef.current = newWidth;
        canvasHeightRef.current = newHeight;

        if (canvas.width !== newWidth * dpr || canvas.height !== newHeight * dpr) {
            canvas.width = newWidth * dpr;
            canvas.height = newHeight * dpr;
            ctx.scale(dpr, dpr);
        }
        // Re-initialize particles if canvas size changes significantly to avoid clumping or sparse areas.
        // This is a simple approach; more complex would involve repositioning existing particles.
        // For now, let's re-create them.
        // particlesRef.current = Array.from({ length: count }, (_, i) => createParticle(i));
    };
    
    resizeCanvas(); // Set initial size and populate refs
    particlesRef.current = Array.from({ length: count }, (_, i) => createParticle(i)); // Initialize after first resize

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvasWidthRef.current, canvasHeightRef.current); // Use ref for current dimensions

      particlesRef.current.forEach((p, index) => {
        if (p.initialDelayFrames > 0) {
          p.initialDelayFrames -= 1;
          return;
        }
        
        p.life += 1;
        p.elapsedFramesAfterDelay +=1;

        // Check boundaries against current canvas dimensions
        if (p.life > p.maxLife || p.y < -p.size * 2 || p.x < -p.size * 2 || p.x > canvasWidthRef.current + p.size * 2 || p.y > canvasHeightRef.current + p.size * 2) {
          particlesRef.current[index] = createParticle(index, true);
          return;
        }
        
        const driftXSpeed = (seededRandomFloat(String(memoizedSystemSeed + p.id + 1)) * 2 - 1) * 1.5;
        const driftYSpeed = (seededRandomFloat(String(memoizedSystemSeed + p.id + 2)) * 2 - 2.5);
        const driftBaseAmount = seededRandomFloat(String(memoizedSystemSeed + p.id + 3)) * 0.5 + 0.2;

        const driftX = (Math.sin(p.elapsedFramesAfterDelay / 40 + memoizedSystemSeed + p.id) * driftBaseAmount * driftXSpeed) * driftAmountFactor;
        const driftY = (Math.cos(p.elapsedFramesAfterDelay / 35 + memoizedSystemSeed + p.id) * driftBaseAmount * driftYSpeed) * driftAmountFactor;
        
        p.x += p.vx + driftX;
        p.y += p.vy + driftY;

        const fadeInDuration = 8;
        const fadeOutDuration = Math.max(5, p.maxLife * 0.6);
        const maxOpacityValue = 0.95;
        let baseOpacity = 0;

        if (p.life >= 0 && p.life < p.maxLife) {
            const fadeInEnd = fadeInDuration;
            const fadeOutStart = p.maxLife - fadeOutDuration;
            if (fadeInEnd >= fadeOutStart) { // handles short lifespans
                const peakTime = Math.max(0.01, Math.min(fadeInEnd, p.maxLife - 0.01));
                baseOpacity = interpolate(p.life, [0, peakTime, p.maxLife], [0, maxOpacityValue, 0]);
            } else {
                baseOpacity = interpolate(p.life, [0, fadeInEnd, fadeOutStart, p.maxLife], [0, maxOpacityValue, maxOpacityValue, 0]);
            }
        }
        p.opacity = Math.max(0, baseOpacity * p.flickerFactor);

        if (p.opacity <= 0) return;

        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size / 2, (p.size * p.aspectRatio) / 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = Math.ceil(p.size * 1.5);
        ctx.shadowColor = p.glowColor.replace(/hsla\(([^,]+,\s*[^,]+,\s*[^,]+),\s*[^)]+\)/, `hsla($1, ${p.opacity * glowOpacity})`);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
    };

    animate();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [count, memoizedSystemSeed, particleBaseColor, glowOpacity, particleSizeMin, particleSizeMax, driftAmountFactor, upwardVelocityFactor]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', pointerEvents: 'none', ...style }} />;
};