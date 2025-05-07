// src/components/AnimatedAsset.tsx
import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';

interface AnimatedAssetProps {
    src: string;
    delaySeconds?: number;
    durationSeconds?: number;
    top?: string | number; left?: string | number; right?: string | number; bottom?: string | number;
    width: number | string;
    height?: number | string;
    initialRotation?: number;
    initialX?: number | string;
    initialY?: number | string;
    targetScale?: number;
    enableIdleAnimation?: boolean;
    idleAmplitude?: number;
    idlePeriodSeconds?: number;
    style?: React.CSSProperties;
    className?: string;
    springConfig?: {
        damping?: number;
        stiffness?: number;
        mass?: number;
    };
}

export const AnimatedAsset: React.FC<AnimatedAssetProps> = ({
    src, delaySeconds = 0, durationSeconds = 0.8,
    top, left, right, bottom, width, height,
    initialRotation = 0, initialX = 0, initialY = 0, targetScale = 1,
    enableIdleAnimation = false, idleAmplitude = 3, idlePeriodSeconds = 3,
    springConfig = { damping: 12, stiffness: 130, mass: 1 },
    style, className
}) => {
    const controls = useAnimation();

    // Define variants with type safety
    const variants: Variants = {
        hidden: {
            opacity: 0,
            x: typeof initialX === 'string' ? initialX : `${initialX}px`,
            y: typeof initialY === 'string' ? initialY : `${initialY}px`,
            scale: 0.4,
            rotate: initialRotation - 15,
            // Ensure initial state has non-zero dimensions if animating size later
            // width: typeof width === 'number' ? `${width}px` : width,
            // height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
        },
        visible: {
            opacity: 1,
            x: "0px",
            y: "0px",
            scale: targetScale,
            rotate: initialRotation,
            transition: {
                type: 'spring',
                ...springConfig,
                delay: delaySeconds, // Delay is handled by the transition itself
                duration: durationSeconds,
            }
        },
        idle: enableIdleAnimation ? {
            x: [0, idleAmplitude, 0, -idleAmplitude, 0].map(v => `${v}px`),
            y: [0, -idleAmplitude * 0.7, 0, idleAmplitude * 0.7, 0].map(v => `${v}px`),
            transition: {
                duration: idlePeriodSeconds,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop",
            }
        } : {}
    };

    useEffect(() => {
        // This effect runs when the component mounts or when specified dependencies change.
        // It defines the sequence of animations.
        // console.log(`useEffect Triggered for: ${src}, Delay: ${delaySeconds}`); // Debugging line
        const sequence = async () => {
            // Start animation sequence
            // The 'visible' state includes the delay in its transition.
            const visibleAnimation = await controls.start("visible");

            // Proceed to idle only if enabled *after* visible completes.
            // Check if the animation successfully completed (not interrupted)
            if (enableIdleAnimation && visibleAnimation?.type !== 'interrupted') {
                // console.log(`Starting idle for: ${src}`); // Debugging line
                controls.start("idle");
            }
        };

        sequence();

        // Cleanup function in case the component unmounts mid-animation
        return () => {
            controls.stop(); // Stop any running animations
        };
        // Dependencies: Re-run the effect if these change.
        // If src changes, we want a new animation sequence.
        // If delay changes, the timing of the 'visible' animation changes.
    }, [controls, enableIdleAnimation, src, delaySeconds, idleAmplitude, idlePeriodSeconds]);

    const combinedStyle: React.CSSProperties = {
        position: 'absolute',
        top, left, right, bottom,
        width: typeof width === 'number' ? `${width}px` : width,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
        transformOrigin: 'center center',
        zIndex: 3,
        ...style,
    };

    return (
        <motion.div
            className={className}
            style={combinedStyle}
            variants={variants}
            initial="hidden" // Always start hidden when component mounts/key changes
            animate={controls} // Let the controls manage the state transitions
        >
            <img
                src={src}
                alt="" // Alt text can be empty for purely decorative images
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                loading="lazy"
                onError={(e) => console.error(`Failed to load asset: ${src}`, (e.target as HTMLImageElement).src)}
            />
        </motion.div>
    );
};