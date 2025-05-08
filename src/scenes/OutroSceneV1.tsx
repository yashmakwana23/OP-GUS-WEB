// src/scenes/OutroSceneV1.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { OutroV1Props } from '../types/quizDataSchema';
// import { ParticleSystem } from '../components/Particles'; // Uncomment if used

// --- Fonts & Colors ---
const scoreFontFamily = '"Bangers", Impact, fantasy, sans-serif';
const ctaFontFamily = "'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif";
const defaultBgColor = '#1a1a2e'; // Fallback if this scene has no BG and App has no global BG
const scoreColor = '#FFD700';
const scoreShadowColor = '#c0392b';

// --- Styles (Copied from original) ---
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' /* Let App BG show through or use own BG */ },
    backgroundMedia: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
    overlay: { position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
    container: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'white', padding: 'clamp(20px, 5vw, 40px)', height: '100%', zIndex: 2, position:'relative' },
    scoreText: {
        fontFamily: scoreFontFamily, fontSize: 'clamp(70px, 20vw, 160px)',
        marginBottom: 'clamp(15px, 5vh, 50px)', color: scoreColor,
        textShadow: `4px 4px 0px ${scoreShadowColor}, 8px 8px 0px #000, 10px 10px 15px rgba(0,0,0,0.6)`,
        letterSpacing: '-0.02em', whiteSpace: 'pre-line', position: 'relative',
    },
    callToAction: {
        fontFamily: ctaFontFamily, fontSize: 'clamp(24px, 7vw, 60px)', fontWeight: 'bold',
        color: '#FFFFFF', textShadow: '2px 2px 5px rgba(0,0,0,0.8)', whiteSpace: 'pre-line',
        lineHeight: 1.2, maxWidth: '90%',
    },
    ctaWordSpan: { display: 'inline-block', marginRight: '0.2em', whiteSpace: 'nowrap' },
};


// --- Framer Motion Variants ---
const scoreVariant = {
    hidden: { opacity: 0, scale: 0.5, rotate: -15 },
    visible: { opacity: 1, scale: 1, rotate: -2, transition: { type: 'spring', damping: 12, stiffness: 130, delay: 0.1 } },
};

const ctaWordVariant = (i: number) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 14, stiffness: 100, delay: 0.4 + i * 0.08 } }
});

interface SceneProps extends OutroV1Props {
    sceneId: string; durationInSeconds: number;
    onSceneEnd: () => void;
    // Props passed by App.tsx, resolved from scene/global data
    backgroundImageUrl?: string | null; 
    backgroundVideoUrl?: string | null;
}

export const OutroSceneV1: React.FC<SceneProps> = ({
    sceneId, scoreText, callToAction, 
    backgroundImageUrl, // Use this directly, App.tsx has resolved it
    backgroundVideoUrl, // Use this directly
    durationInSeconds, onSceneEnd,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onSceneEnd();
        }, durationInSeconds * 1000);
        return () => clearTimeout(timer);
    }, [durationInSeconds, onSceneEnd]);

    const ctaWords = callToAction.split(/(\s+)/).filter(word => word.trim().length > 0);

    return (
        <motion.div style={{
            ...styles.sceneRoot,
            backgroundColor: (!backgroundVideoUrl && !backgroundImageUrl) ? defaultBgColor : 'transparent',
          }}
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        >
             {backgroundVideoUrl && <motion.video src={backgroundVideoUrl} autoPlay muted loop playsInline style={styles.backgroundMedia} initial={{scale: 1.1}} animate={{scale: 1.3, y: -15}} transition={{duration: durationInSeconds, ease:'linear'}}/>}
             {!backgroundVideoUrl && backgroundImageUrl && <motion.img src={backgroundImageUrl} alt="" style={styles.backgroundMedia} initial={{scale: 1.1}} animate={{scale: 1.3, y: -15}} transition={{duration: durationInSeconds, ease:'linear'}}/>}
             <div style={styles.overlay} /> {/* Consider if overlay is always needed or configurable */}

            {/* <ParticleSystem count={150} systemSeed={`outro-${sceneId}`} /> */}

            <motion.div style={styles.container} initial="hidden" animate="visible">
                <motion.h1 style={styles.scoreText} variants={scoreVariant}>
                    {scoreText}
                </motion.h1>
                <motion.h2 style={styles.callToAction}>
                     {ctaWords.map((word, index) => (
                        <motion.span
                            key={index}
                            style={styles.ctaWordSpan}
                            variants={ctaWordVariant(index)}
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.h2>
            </motion.div>
        </motion.div>
    );
};