// src/components/ProgressBar.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number; // Value between 0 and 1
    backgroundColor?: string;
    fillColor?: string;
    height?: number;
    borderRadius?: number;
    className?: string; // Allow passing Tailwind classes etc.
}
export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    backgroundColor = 'rgba(0,0,0,0.15)',
    fillColor = 'linear-gradient(90deg, #ffd700 0%, #ffeb7e 100%)',
    height = 18,
    borderRadius = 9,
    className
}) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    // console.log("Progress Bar value:", clampedProgress); // For debugging

    return (
        <div
            style={{
                width: '100%',
                height: `${height}px`,
                borderRadius: `${borderRadius}px`,
                background: backgroundColor,
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.25)',
            }}
            className={className}
        >
            <motion.div
                style={{
                    height: '100%',
                    background: fillColor,
                    borderRadius: `${borderRadius}px`,
                    originX: 0, // Animate width from the left
                }}
                // Animate the width percentage
                initial={{ width: "0%" }} // Start at 0 on mount
                animate={{ width: `${clampedProgress * 100}%` }} // Animate to current progress
                // Use a spring for a slightly bouncier feel, or tween for linear
                transition={{ type: "spring", damping: 25, stiffness: 150, duration: 0.4 }}
                // Or: transition={{ type: "tween", ease: "linear", duration: 0.15 }} // Faster linear update
            />
        </div>
    );
};