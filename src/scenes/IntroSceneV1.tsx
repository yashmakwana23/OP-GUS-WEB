// src/scenes/IntroSceneV1.tsx
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { IntroV1Props as IntroScenePropsRemotion } from '../types/quizDataSchema'; // Original props
import { RippleBackground } from '../components/RippleBackground';
import { AnimatedAsset } from '../components/AnimatedAsset'; // Migrated web version

interface SceneProps extends IntroScenePropsRemotion {
    sceneId: string; durationInSeconds: number;
    onSceneEnd: () => void;
    globalBackgroundImageUrl?: string | null; globalBackgroundVideoUrl?: string | null;
}

const headingFontFamily = '"Bangers", "Luckiest Guy", Impact, fantasy, sans-serif';

const styles: Record<string, React.CSSProperties> = {
    sceneRoot: { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    contentLayer: { zIndex: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' },
    heading: { fontFamily: headingFontFamily, fontSize: 'clamp(80px, 25vw, 200px)', color: '#0d1b4d', lineHeight: 0.85, margin: 0, letterSpacing: '-0.05em', whiteSpace: 'pre-line', position: 'relative', zIndex: 5 },
    headingLineWrapper: { display: 'block', transformOrigin: 'center center' },
    // Precise graphic positioning will now be relative to the container, using percentages or viewport units
    graphic1Pos: { position: 'absolute', top: '50%', left: '50%', zIndex: 4, width: 'clamp(150px, 40vw, 420px)' }, // Example width
    graphic2Pos: { position: 'absolute', top: '50%', left: '50%', zIndex: 4, width: 'clamp(140px, 38vw, 390px)' }, // Example width
};

// Animation config for slam bounce
const slamBounceTransition = (delay: number) => ({
    type: 'spring',
    damping: 8.5,
    stiffness: 170,
    mass: 0.7,
    delay,
});

const lineVariant = (delay: number) => ({
    hidden: { opacity: 0, scale: 0.05, rotate: 40, y: 25 },
    visible: {
        opacity: 1, scale: 1, rotate: 0, y: 0,
        transition: slamBounceTransition(delay)
    },
    // For the specific rotation effect in original [40, -13, 0]
    // We can use keyframes for rotate
    visibleComplex: {
        opacity: [0, 1, 1], scale: [0.05, 1.1, 1], rotate: [40, -10, 0], y: [25, -5, 0],
        transition: { 
            ...slamBounceTransition(delay), 
            duration: 0.7, // Adjust duration for keyframes
            times: [0, 0.6, 1] // Timing for keyframes
        }
    }
});


export const IntroSceneV1: React.FC<SceneProps> = ({
    sceneId, durationInSeconds, onSceneEnd,
    characterName, headingText = "QUIZ\nTIME\nARE YOU", // Default from Remotion
    // backgroundImageUrl, backgroundVideoUrl, // These will be handled by App.tsx or globally
}) => {
    useEffect(() => {
        const timer = setTimeout(() => onSceneEnd(), durationInSeconds * 1000);
        return () => clearTimeout(timer);
    }, [durationInSeconds, onSceneEnd]);

    const textLines = headingText.replace('{characterName}', characterName ?? '').split('\n');
    const lineDelays = [0.1, 0.2, 0.3]; // Base delays in seconds

    // Graphic asset delays
    const graphic1Delay = 0.3;
    const graphic2Delay = 0.2;
    const graphicDuration = 1.5;

    return (
        <motion.div style={styles.sceneRoot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RippleBackground count={7} color="rgba(205, 210, 220, 0.6)" />
            {/* HalftonePattern.tsx would need migration if used, for now it's omitted.
                For web, this could be an SVG pattern or a CSS radial-gradient trick. */}

            <div style={styles.contentLayer}>
                <h1 style={styles.heading}>
                    {textLines.map((line, index) => (
                        <motion.span
                            key={index}
                            style={styles.headingLineWrapper}
                            variants={lineVariant(lineDelays[index] || 0)}
                            initial="hidden"
                            animate="visibleComplex" // Use the keyframed variant
                        >
                            {line}
                        </motion.span>
                    ))}
                </h1>

                {/* Graphics - Adjust translate percentages for precise overlap based on new width definitions */}
                <div style={styles.graphic1Pos}>
                    <AnimatedAsset
                        src="/images/fun-bear-stars.png"
                        delaySeconds={graphic1Delay}
                        durationSeconds={graphicDuration}
                        width="100%" // Relative to its container
                        initialRotation={-15}
                        style={{ transform: `translateX(-70%) translateY(10%)` }} // Fine-tune this
                    />
                </div>
                <div style={styles.graphic2Pos}>
                    <AnimatedAsset
                        src="/images/fun-bear-surprised.png"
                        delaySeconds={graphic2Delay}
                        durationSeconds={graphicDuration}
                        width="100%" // Relative to its container
                        initialRotation={20}
                        style={{ transform: `translateX(65%) translateY(-75%)` }} // Fine-tune this
                    />
                </div>
            </div>
        </motion.div>
    );
};