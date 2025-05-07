// src/scenes/PinkGridQuizScene.tsx
// NOTE: This component uses the V2 layout (image above text, grid options, V2 Title)
// but is named PinkGridQuizScene to match the variant name in quizDataSchema
// and uses the PinkGridQuizProps type.

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// Use V1 Props type, but implement V2 layout
import type { PinkGridQuizProps } from '../types/quizDataSchema';

// --- Component Imports ---
import { AnimatedAsset } from '../components/AnimatedAsset';
import { CircularTimer } from '../components/CircularTimer';
import { ProgressBar } from '../components/ProgressBar';
import { ParticleSystem } from '../components/Particles';
// import { SpeedLines } from '../components/SpeedLines';

// --- Fonts ---
const titleFont = '"Bangers", Impact, fantasy, sans-serif'; // For "GUESS THE CHARACTER" part
const subTitleFont = '"Poppins", sans-serif'; // For "DIFFICULTY: EASY" part
const questionFont = '"Poppins", sans-serif';
const optionFont = '"Poppins", sans-serif';

// --- Colors ---
const themeYellow = '#ffd700';
const themePinkGradientEnd = '#ffeb7e'; // For progress bar gradient
const textColorDark = '#333';
const textColorLight = 'white';
const outlineColor = 'black';
const correctBgColor = '#66bb6a';
const correctBgGradientEnd = '#81c784';
const defaultSceneBgColor = '#a7c7e7';

// --- Constants ---
const progressBarFill = `linear-gradient(90deg, ${themeYellow} 0%, ${themePinkGradientEnd} 100%)`;
const progressBarBg = 'rgba(0, 0, 0, 0.2)';
const optionButtonBg = themeYellow; // Solid yellow for V2 style options
const correctOptionButtonBg = correctBgColor; // Solid green for correct
const correctOptionTextStyle = { color: textColorLight, textShadow: `1px 1px 0px rgba(0,0,0,0.3)` };

// --- Styles (Based on V2 layout, including V2 Title) ---
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: defaultSceneBgColor },
    backgroundMedia: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
    overlay: { position: 'absolute', inset: 0, zIndex: 1 },
    effectsLayer: { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' },
    decorLayer: { position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' },
    contentArea: { position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(10px, 2vw, 20px)', paddingTop: 'clamp(60px, 12vh, 100px)', paddingBottom: 'clamp(100px, 20vh, 180px)', boxSizing: 'border-box', zIndex: 5, gap: 'clamp(10px, 1.5vh, 15px)', overflowY: 'auto' },
    topBar: { position: 'absolute', top: 'clamp(10px, 2vh, 20px)', left: 'clamp(10px, 2vw, 20px)', right: 'clamp(10px, 2vw, 20px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
    logoImage: { width: 'clamp(100px, 25vw, 180px)', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))' },
    timerContainer: {},

    // ADDED: Title Block (V2 Style) - Sits within contentArea flow now
    titleBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '90%',
        maxWidth: '450px',
        // Let contentArea gap handle spacing, remove negative margin
    },
    mainTitleText: { // "GUESS THE CHARACTER"
        fontFamily: titleFont, // Bangers
        fontSize: 'clamp(28px, 7vw, 50px)',
        color: textColorDark,
        backgroundColor: themeYellow,
        padding: 'clamp(5px, 1vh, 10px) clamp(15px, 4vw, 30px)',
        borderRadius: 'clamp(8px, 1.5vw, 12px)',
        border: `max(2px, 0.3vw) solid ${outlineColor}`,
        boxShadow: `max(3px, 0.5vw) max(3px, 0.5vw) 0px ${outlineColor}`, // 3D border effect
        textShadow: '1px 1px 1px rgba(255,255,255,0.3)',
        lineHeight: 1.1,
        zIndex: 1, // Above difficulty
        marginBottom: '-clamp(5px, 1vh, 10px)', // Overlap with difficulty text
        transform: 'rotate(-1deg)', // Slight tilt
    },
    difficultyText: { // "DIFFICULTY: EASY"
        fontFamily: subTitleFont, // Poppins
        fontSize: 'clamp(20px, 5vw, 36px)',
        paddingTop: 'clamp(8px, 1.5vh, 15px)', // Add padding top because marginBottom is negative
        color: textColorLight,
        fontWeight: 'bold',
        textShadow: `-1.5px -1.5px 0 ${outlineColor}, 1.5px -1.5px 0 ${outlineColor}, -1.5px 1.5px 0 ${outlineColor}, 1.5px 1.5px 0 ${outlineColor}, 2px 2px 3px rgba(0,0,0,0.3)`,
        lineHeight: 1,
        whiteSpace: 'pre-line', // For titleText prop splitting
        zIndex: 0,
    },
    // END ADDED: Title Block

    questionBox: { width: '85%', maxWidth: '480px', backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`, boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`, padding: 'clamp(10px, 2vw, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 1.5vh, 12px)', minHeight: 'clamp(100px, 20vh, 180px)' },
    questionImageContainer: { width: '100%', aspectRatio: '16/10', maxHeight: 'clamp(150px, 30vh, 250px)', borderRadius: 'clamp(10px, 1.5vw, 15px)', border: `max(2px, 0.4vw) solid ${outlineColor}`, overflow: 'hidden' },
    questionImage: { width: '100%', height: '100%', objectFit: 'cover' },
    questionTextBelowImage: { fontFamily: questionFont, fontSize: 'clamp(14px, 3vw, 22px)', fontWeight: '600', color: textColorDark, textAlign: 'center', width: '95%', whiteSpace: 'pre-line', lineHeight: 1.2 },
    progressBarContainer: { width: '70%', maxWidth: '350px', margin: '0 auto' },
    optionsBox: { width: '90%', maxWidth: '500px', backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`, boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`, padding: 'clamp(15px, 2.5vw, 25px)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(10px, 2vw, 15px)' },
    optionButton: { backgroundColor: optionButtonBg, borderRadius: 'clamp(12px, 2vw, 20px)', border: `max(2.5px, 0.5vw) solid ${outlineColor}`, boxShadow: `max(3px, 0.6vw) max(3px, 0.6vw) 0px ${outlineColor}`, padding: 'clamp(8px, 1.5vh, 15px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: 'clamp(45px, 8vh, 70px)', transition: 'transform 0.1s ease-out, background-color 0.2s, opacity 0.2s', cursor: 'pointer' },
    optionLabel: { fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: '900', color: textColorDark, minWidth: 'clamp(25px, 5vw, 40px)', textAlign: 'center', marginRight: 'clamp(5px, 1vw, 10px)', textShadow: '1px 1px 0px rgba(255,255,255,0.5)' },
    optionText: { fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: 'bold', color: textColorDark, flexGrow: 1, textAlign: 'left', textShadow: '1px 1px 0px rgba(255,255,255,0.5)', whiteSpace: 'pre-line', lineHeight: 1.1 },
    correctOptionStyle: { backgroundColor: correctOptionButtonBg },
    // correctOptionTextStyle defined as const above
    incorrectOptionStyle: { opacity: 0.6, transform: 'scale(0.97)', filter: 'grayscale(30%)' },
    crewImageContainer: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: `clamp(120px, 22vh, 200px)`, zIndex: 4, overflow: 'hidden', maskImage: 'linear-gradient(to top, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)', pointerEvents: 'none' },
    crewImage: { display: 'block', position: 'absolute', bottom: '-10%', height: '100%', width: '100%', left: '0%', objectFit: 'contain', objectPosition: 'center bottom' },
};

// --- Framer Motion Variants ---
const UIVariant = (delay = 0, yStart = 15, scaleStart = 0.9, duration = 0.5) => ({
  initial: { opacity: 0, y: yStart, scale: scaleStart },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 130, delay, duration } },
  exit: { opacity: 0, y: yStart, scale: scaleStart, transition: { duration: 0.25 } }
});

const contentVariant = (delay = 0) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { delay, duration: 0.4 } }
});

// --- Scene Component Interface (Using PinkGridQuizProps - V1) ---
interface SceneProps extends PinkGridQuizProps {
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
    globalBackgroundImageUrl?: string | null;
    globalBackgroundVideoUrl?: string | null;
    // Props already in PinkGridQuizProps:
    // titleText, questionText, options, referenceImageUrl, correctAnswerId, timerDuration,
    // backgroundUrl, backgroundVideoUrl, enableOverlay, overlayColor, crewImageUrl, logoUrl
}

// --- Scene Component (Function Name Changed) ---
export const PinkGridQuizScene: React.FC<SceneProps> = ({
    sceneId, titleText = "GUESS THE CHARACTER\nDIFFICULTY: EASY", // Default matching V2 style
    questionText, // V1 props require this
    options,
    referenceImageUrl, // V1 props may or may not require this depending on your schema use
    correctAnswerId, timerDuration,
    durationInSeconds, onSceneEnd, backgroundUrl, backgroundVideoUrl, enableOverlay, overlayColor,
    crewImageUrl, logoUrl = "/images/anime-logo-placeholder.png",
    globalBackgroundImageUrl, globalBackgroundVideoUrl,
}) => {
    const effectiveTimer = timerDuration ?? 5;
    const [timeLeft, setTimeLeft] = useState(effectiveTimer);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const tickAudioRef = useRef<HTMLAudioElement>(null);
    const revealAudioRef = useRef<HTMLAudioElement>(null);

    // --- Timers & Scene End Logic (Keep robust version) ---
    useEffect(() => {
        let sceneEndTimeoutId: NodeJS.Timeout | undefined;
        if (isRevealing && answered) {
            sceneEndTimeoutId = setTimeout(() => {
                onSceneEnd({ sceneId, isCorrect: selectedId === correctAnswerId });
            }, 3000);
        } else if (!answered) {
             sceneEndTimeoutId = setTimeout(() => {
                if (!answered) {
                    setIsRevealing(true);
                    setAnswered(true);
                    revealAudioRef.current?.play().catch(e=>console.warn("Reveal audio failed (scene timeout)", e));
                }
            }, durationInSeconds * 1000);
        }
        return () => clearTimeout(sceneEndTimeoutId);
    }, [isRevealing, answered, durationInSeconds, onSceneEnd, sceneId, correctAnswerId, selectedId]);

    useEffect(() => {
        if (answered || timeLeft <= 0) {
            tickAudioRef.current?.pause();
            if (timeLeft <= 0 && !answered) {
                setAnswered(true);
                setIsRevealing(true);
                revealAudioRef.current?.play().catch(e=>console.warn("Reveal audio failed (timer ran out)", e));
            }
            return;
        }
        const intervalId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        const playTick = async () => {
            try { if (tickAudioRef.current) { tickAudioRef.current.currentTime = 0; await tickAudioRef.current.play(); } } catch (e) {}
        };
        playTick();
        return () => { clearInterval(intervalId); tickAudioRef.current?.pause(); };
    }, [timeLeft, answered]);


    // --- Interaction Handler ---
    const handleSelect = (id: string) => {
        if (answered) return;
        setSelectedId(id);
        setAnswered(true);
        setIsRevealing(true);
        revealAudioRef.current?.play().catch(e=>console.warn("Reveal audio on select failed", e));
    };

    // --- Derived State & Variables ---
    const [mainTitle, difficulty] = titleText.split('\n'); // Assumes titleText format from V2
    const timerProg = Math.max(0, Math.min(1, timeLeft / effectiveTimer));
    const currentBgVideoUrl = backgroundVideoUrl; // Use prop directly
    const currentBgImageUrl = backgroundUrl; // Use prop directly

    // --- Animation Delays ---
    const logoTimerDelay = 0.1;
    const titleDelay = 0.2;
    const questionBoxDelay = 0.3;
    const questionContentBaseDelay = questionBoxDelay + 0.1;
    const progressBarDelay = 0.4;
    const optionsBoxDelay = 0.45;
    const optionStagger = 0.07;
    const crewImageDelay = 0.5;
    const decorBaseDelayS = 0.3;
    const decorStaggerS = 0.08;

    return (
        // --- JSX Structure (Using V2 Layout) ---
        <div style={styles.sceneRoot}>
            {/* Backgrounds & Overlay (App handles global fallback) */}
            {currentBgVideoUrl && (<video src={currentBgVideoUrl} autoPlay muted loop playsInline style={styles.backgroundMedia} key={`scene-bgvid-${currentBgVideoUrl}`} />)}
            {!currentBgVideoUrl && currentBgImageUrl && (<img src={currentBgImageUrl} alt="" style={styles.backgroundMedia} key={`scene-bgimg-${currentBgImageUrl}`} loading="lazy" />)}
            {enableOverlay && overlayColor && <div style={{...styles.overlay, backgroundColor: overlayColor}} />}

            <div style={styles.effectsLayer}>
                 <ParticleSystem count={60} systemSeed={`pinkgrid-particles-${sceneId}`} particleBaseColor="hsl(330, 80%, 75%)" glowOpacity={0.3} />
            </div>

            <div style={styles.decorLayer}>
                {/* Decor assets */}
                <AnimatedAsset src="/images/decor-squiggle-pink.png" delaySeconds={decorBaseDelayS + decorStaggerS * 0} top="3%" left="50%" width={150} initialRotation={-15} initialX="-50%" style={{transform: 'translateX(-50%)'}} />
				<AnimatedAsset src="/images/decor-arrow-black.png" delaySeconds={decorBaseDelayS + decorStaggerS * 1} top="22%" left="3%" width={100} initialRotation={-100} initialX={-120} />
				<AnimatedAsset src="/images/decor-star-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 2} top="40%" right="4%" width={190} initialRotation={15} initialX={150} />
				<AnimatedAsset src="/images/decor-lightning-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 3} bottom="clamp(120px, 22vh, 250px)" right="1%" width={310} initialRotation={10} initialX={150} initialY={80} />
				<AnimatedAsset src="/images/decor-circle-text.png" delaySeconds={decorBaseDelayS + decorStaggerS * 4} bottom="clamp(130px, 24vh, 280px)" left="4%" width={200} initialRotation={-5} initialX={-150} initialY={80} />
            </div>

            <div style={styles.topBar}>
                <motion.div variants={UIVariant(logoTimerDelay, -20)} initial="initial" animate="animate">
                    {logoUrl && <img src={logoUrl} style={styles.logoImage} alt="Logo" />}
                </motion.div>
                <motion.div style={styles.timerContainer} variants={UIVariant(logoTimerDelay, -20)} initial="initial" animate="animate">
                    {effectiveTimer > 0 && <CircularTimer remainingSeconds={timeLeft} totalDurationSeconds={effectiveTimer} size={Math.min(window.innerWidth*0.12, 65)} strokeWidth={Math.min(window.innerWidth*0.012, 7)} progressColor={themeYellow} />}
                </motion.div>
            </div>

            <div style={styles.contentArea}>
                 {/* Title Block - ADDED BACK */}
                <motion.div style={styles.titleBlock} variants={UIVariant(titleDelay)} initial="initial" animate="animate">
                    {mainTitle && <div style={styles.mainTitleText}>{mainTitle}</div>}
                    {difficulty && <div style={styles.difficultyText}>{difficulty}</div>}
                </motion.div>

                {/* Question Box (V2 Layout: Image above Text) */}
                <motion.div style={styles.questionBox} variants={UIVariant(questionBoxDelay)} initial="initial" animate="animate">
                    {referenceImageUrl && (
                        <motion.div style={styles.questionImageContainer} variants={contentVariant(questionContentBaseDelay)} initial="initial" animate="animate">
                            <img src={referenceImageUrl} style={styles.questionImage} alt="Question context"/>
                        </motion.div>
                    )}
                    {/* V1 Prop Schema requires questionText */}
                    <motion.div style={styles.questionTextContainerV2} variants={contentVariant(questionContentBaseDelay + 0.05)} initial="initial" animate="animate">
                        <div style={styles.questionTextV2}>{questionText}</div>
                    </motion.div>
                </motion.div>

                {effectiveTimer > 0 &&
                    <motion.div style={styles.progressBarContainer} variants={UIVariant(progressBarDelay)} initial="initial" animate="animate">
                        <ProgressBar progress={timerProg} fillColor={progressBarFill} backgroundColor={progressBarBg} height={Math.min(window.innerWidth * 0.03, 20)} />
                    </motion.div>
                }

                {/* Options Box (Grid Layout) */}
                <motion.div style={styles.optionsBox} variants={UIVariant(optionsBoxDelay)} initial="initial" animate="animate">
                     {options.map((opt, i) => {
                        const isCorrectOpt = opt.id === correctAnswerId;
                        const isSelectedOpt = opt.id === selectedId;
                        let dynamicButtonStyle: React.CSSProperties = {};
                        let dynamicTextStyle: React.CSSProperties = {};

                        if (isRevealing && answered) {
                            if (isCorrectOpt) {
                                dynamicButtonStyle = styles.correctOptionStyle;
                                dynamicTextStyle = correctOptionTextStyle;
                            } else if (isSelectedOpt) {
                                dynamicButtonStyle = { ...styles.incorrectOptionStyle, outline: `max(2px,0.4vw) solid red` };
                            } else {
                                dynamicButtonStyle = styles.incorrectOptionStyle;
                            }
                        }
                        return (
                             <motion.button
                                key={opt.id} style={{ ...styles.optionButton, ...dynamicButtonStyle }}
                                onClick={() => handleSelect(opt.id)} disabled={answered}
                                variants={UIVariant(optionStagger * i, 10, 0.95, 0.3)}
                                initial="initial" animate="animate"
                                whileHover={!answered ? { scale: 1.03, filter:'brightness(1.1)' } : {}}
                                whileTap={!answered ? { scale: 0.97 } : {}}>
                                <span style={{...styles.optionLabel, ...dynamicTextStyle}}>{opt.id}.</span>
                                <span style={{...styles.optionText, ...dynamicTextStyle}}>{opt.text}</span>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {crewImageUrl &&
                <motion.div style={styles.crewImageContainer} variants={UIVariant(crewImageDelay, 60)} initial="initial" animate="animate">
                    <img src={crewImageUrl} style={styles.crewImage} alt="Decorative crew"/>
                </motion.div>
            }
            <audio ref={tickAudioRef} src="/audio/ticking.mp3" loop preload="auto" />
            <audio ref={revealAudioRef} src="/audio/reveal.mp3" preload="auto" />
        </div>
    );
};