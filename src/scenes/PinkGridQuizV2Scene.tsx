// src/scenes/PinkGridQuizV2Scene.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PinkGridQuizV2Props } from '../types/quizDataSchema';

import { AnimatedAsset } from '../components/AnimatedAsset';
import { CircularTimer } from '../components/CircularTimer'; // Assuming this component exists and works
import { ProgressBar } from '../components/ProgressBar';
import { ParticleSystem } from '../components/Particles';
// import { SpeedLines } from '../components/SpeedLines';

// --- Fonts & Colors (Copied from original, ensure they are consistent or managed globally) ---
const titleFont = '"Bangers", Impact, fantasy, sans-serif';
const subTitleFont = '"Poppins", sans-serif';
const questionFont = '"Poppins", sans-serif';
const optionFont = '"Poppins", sans-serif';
const themeYellow = '#ffd700';
const textColorDark = '#333';
const textColorLight = 'white';
const outlineColor = 'black';
const correctBgColor = '#66bb6a';
const defaultSceneBgColor = '#a7c7e7'; // Fallback if scene has no BG and App has no global BG
const progressBarFill = `linear-gradient(90deg, ${themeYellow} 0%, #ffeb7e 100%)`;
const progressBarBg = 'rgba(0, 0, 0, 0.2)';

// --- Styles (Copied from original, ensure they are responsive and mobile-first) ---
// (styles object omitted for brevity - assume it's the same as provided)
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: {
        position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        // backgroundColor: defaultSceneBgColor, // Scene BG is handled by its own image/video or App's global BG
    },
    backgroundMedia: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
    overlay: { position: 'absolute', inset: 0, zIndex: 1 }, 
    effectsLayer: { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' },
    decorLayer: { position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' },
    contentArea: {
        position: 'relative', width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(10px, 2vw, 20px)', paddingTop: 'clamp(60px, 12vh, 100px)',
        paddingBottom: 'clamp(100px, 20vh, 180px)', boxSizing: 'border-box', zIndex: 5,
        gap: 'clamp(10px, 1.5vh, 15px)',
    },
    topBar: {
        position: 'absolute', top: 'clamp(10px, 2vh, 20px)', left: 'clamp(10px, 2vw, 20px)',
        right: 'clamp(10px, 2vw, 20px)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 10,
    },
    logoImage: {
        width: 'clamp(100px, 25vw, 180px)', height: 'auto', objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))',
    },
    timerContainer: {},
    titleBlock: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        width: '90%', maxWidth: '450px',
    },
    mainTitleText: { 
        fontFamily: titleFont, fontSize: 'clamp(28px, 7vw, 50px)', color: textColorDark,
        backgroundColor: themeYellow, padding: 'clamp(5px, 1vh, 10px) clamp(15px, 4vw, 30px)',
        borderRadius: 'clamp(8px, 1.5vw, 12px)', border: `max(2px, 0.3vw) solid ${outlineColor}`,
        boxShadow: `max(3px, 0.5vw) max(3px, 0.5vw) 0px ${outlineColor}`, 
        textShadow: '1px 1px 1px rgba(255,255,255,0.3)', lineHeight: 1.1, zIndex: 1,
        marginBottom: '-clamp(5px, 1vh, 10px)', transform: 'rotate(-1deg)',
    },
    difficultyText: {
        fontFamily: subTitleFont, fontSize: 'clamp(20px, 5vw, 36px)',
        paddingTop: 'clamp(5px, 1vh, 10px)', color: textColorLight, fontWeight: 'bold',
        textShadow: `-1.5px -1.5px 0 ${outlineColor}, 1.5px -1.5px 0 ${outlineColor}, -1.5px 1.5px 0 ${outlineColor}, 1.5px 1.5px 0 ${outlineColor}, 2px 2px 3px rgba(0,0,0,0.3)`,
        lineHeight: 1, whiteSpace: 'pre-line', zIndex: 0,
    },
    questionBox: {
        width: '85%', maxWidth: '480px', backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`,
        boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`,
        padding: 'clamp(10px, 2vw, 20px)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 'clamp(8px, 1.5vh, 12px)',
        minHeight: 'clamp(100px, 20vh, 180px)',
    },
    questionImageContainer: {
        width: '100%', aspectRatio: '16/10', maxHeight: 'clamp(150px, 30vh, 250px)',
        borderRadius: 'clamp(10px, 1.5vw, 15px)', border: `max(2px, 0.4vw) solid ${outlineColor}`,
        overflow: 'hidden',
    },
    questionImage: { width: '100%', height: '100%', objectFit: 'cover' },
    questionTextBelowImage: {
        fontFamily: questionFont, fontSize: 'clamp(14px, 3vw, 26px)', fontWeight: '600',
        color: textColorDark, textAlign: 'center', width: '95%', whiteSpace: 'pre-line',
        lineHeight: 1.2,
    },
    progressBarContainer: { width: '70%', maxWidth: '350px', margin: '0 auto' },
    optionsBox: {
        width: '90%', maxWidth: '500px', backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`,
        boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`,
        padding: 'clamp(15px, 2.5vw, 25px)', display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(10px, 2vw, 15px)',
    },
    optionButton: {
        backgroundColor: themeYellow, borderRadius: 'clamp(12px, 2vw, 20px)',
        border: `max(2.5px, 0.5vw) solid ${outlineColor}`,
        boxShadow: `max(3px, 0.6vw) max(3px, 0.6vw) 0px ${outlineColor}`,
        padding: 'clamp(8px, 1.5vh, 15px)', display: 'flex', alignItems: 'center',
        justifyContent: 'flex-start', minHeight: 'clamp(45px, 8vh, 70px)',
        transition: 'transform 0.1s ease-out, background-color 0.2s, opacity 0.2s',
        cursor: 'pointer',
    },
    optionLabel: {
        fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: '900',
        color: textColorDark, minWidth: 'clamp(25px, 5vw, 40px)', textAlign: 'center',
        marginRight: 'clamp(5px, 1vw, 10px)', textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
    },
    optionText: {
        fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: 'bold',
        color: textColorDark, flexGrow: 1, textAlign: 'left',
        textShadow: '1px 1px 0px rgba(255,255,255,0.5)', whiteSpace: 'pre-line', lineHeight: 1.1,
    },
    correctOptionStyle: { backgroundColor: correctBgColor },
    correctOptionTextStyle: { color: textColorLight, textShadow: `1px 1px 0px rgba(0,0,0,0.3)` },
    incorrectOptionStyle: { opacity: 0.6, transform: 'scale(0.97)', filter: 'grayscale(30%)' },
    crewImageContainer: {
        position: 'absolute', bottom: 0, left: 0, width: '100%',
        height: `clamp(120px, 22vh, 200px)`, zIndex: 4, overflow: 'hidden',
        maskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
        pointerEvents: 'none',
    },
    crewImage: {
        display: 'block', position: 'absolute', bottom: '-10%', height: '100%',
        width: '100%', left: '0%', objectFit: 'contain', objectPosition: 'center bottom',
    },
};


// Framer Motion Variants
const UIVariant = (delay = 0, yStart = 15, scaleStart = 0.9, duration = 0.5) => ({
  initial: { opacity: 0, y: yStart, scale: scaleStart },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 130, delay, duration } },
  exit: { opacity: 0, y: yStart, scale: scaleStart, transition: { duration: 0.25 } }
});

interface SceneProps extends PinkGridQuizV2Props { // From quizDataSchema
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
    // These are now consistently passed by App.tsx, resolved from scene/global data
    backgroundImageUrl?: string | null; 
    backgroundVideoUrl?: string | null;
    // Globals are also passed if the scene needs them for more complex logic, but typically not used for direct rendering here
    globalBackgroundImageUrl?: string | null;
    globalBackgroundVideoUrl?: string | null;
}

export const PinkGridQuizV2Scene: React.FC<SceneProps> = ({
    sceneId, titleText = "GUESS THE CHARACTER\nDIFFICULTY: EASY",
    questionText, options, referenceImageUrl, correctAnswerId, timerDuration,
    durationInSeconds, onSceneEnd,
    // Scene specific backgrounds (resolved and passed by App.tsx)
    backgroundImageUrl, // This is the one to use for this scene's image BG
    backgroundVideoUrl, // This is the one to use for this scene's video BG
    // Original props from schema (backgroundUrl might be redundant if App.tsx maps it to backgroundImageUrl)
    backgroundUrl: originalSchemaBackgroundUrl, 
    enableOverlay, overlayColor,
    crewImageUrl, logoUrl = "/images/anime-logo-placeholder.png",
    // globalBackgroundImageUrl, globalBackgroundVideoUrl, // Available if needed
}) => {
    const effectiveTimer = timerDuration ?? 5;
    const [timeLeft, setTimeLeft] = useState(effectiveTimer);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const tickAudioRef = useRef<HTMLAudioElement>(null);
    const revealAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        let sceneEndTimeoutId: number | undefined; // Correct type for browser timeout ID
        if (isRevealing && answered) {
            sceneEndTimeoutId = setTimeout(() => {
                onSceneEnd({ sceneId, isCorrect: selectedId === correctAnswerId });
            }, 3000); // Standard 3-second reveal
        } else if (!answered) {
             // This is the main scene duration timer if no answer is given
             sceneEndTimeoutId = setTimeout(() => {
                if (!answered) { // Re-check in case answered during timeout
                    setIsRevealing(true);
                    setAnswered(true); // Mark as answered (timeout is an answer type)
                    setSelectedId(null); // No option was selected
                    revealAudioRef.current?.play().catch(e=>console.warn("Reveal audio failed (scene timeout)", e));
                    // onSceneEnd will be called by the above (isRevealing && answered) block after its own 3s timeout
                }
            }, durationInSeconds * 1000);
        }
        return () => clearTimeout(sceneEndTimeoutId);
    }, [isRevealing, answered, durationInSeconds, onSceneEnd, sceneId, correctAnswerId, selectedId]);

    // Countdown timer logic
    useEffect(() => {
        if (answered || timeLeft <= 0) {
            tickAudioRef.current?.pause();
            if (timeLeft <= 0 && !answered) { // Timer ran out before user answered
                setAnswered(true);
                setIsRevealing(true);
                setSelectedId(null); // No option was selected
                revealAudioRef.current?.play().catch(e=>console.warn("Reveal audio failed (timer ran out)", e));
                // The main sceneEnd timer will handle progressing after reveal duration
            }
            return;
        }
        const intervalId = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
        
        // Play tick only if time is above 0 and not revealing answer yet
        if (timeLeft > 0 && !isRevealing) {
            tickAudioRef.current?.play().catch(e => console.warn("Tick audio failed", e));
        }

        return () => {
            clearInterval(intervalId);
            if (tickAudioRef.current && !tickAudioRef.current.paused) {
                 tickAudioRef.current.pause();
                 tickAudioRef.current.currentTime = 0; // Reset tick sound
            }
        };
    }, [timeLeft, answered, isRevealing]);


    const handleSelect = (id: string) => {
        if (answered) return;
        setSelectedId(id);
        setAnswered(true);
        setIsRevealing(true);
        revealAudioRef.current?.play().catch(e=>console.warn("Reveal audio on select failed", e));
        // Main sceneEnd timer will handle progressing after reveal duration
    };

    const [mainTitle, difficulty] = titleText.split('\n');
    const timerProg = effectiveTimer > 0 ? Math.max(0, Math.min(1, timeLeft / effectiveTimer)) : 0;

    // Use the direct backgroundUrl/backgroundImageUrl props passed by App.tsx
    // `backgroundImageUrl` prop should be prioritized as App.tsx resolves it.
    // `originalSchemaBackgroundUrl` is kept for flexibility if scene has very specific logic, but generally not needed.
    const currentBgVideoUrl = backgroundVideoUrl;
    const currentBgImageUrl = backgroundImageUrl || originalSchemaBackgroundUrl;


    const decorBaseDelayS = 0.2; const decorStaggerS = 0.07;

    return (
        <motion.div
            style={{
                ...styles.sceneRoot,
                // Fallback BG color if this scene has no image/video AND App has no global BG (transparent App BG)
                backgroundColor: (!currentBgVideoUrl && !currentBgImageUrl) ? defaultSceneBgColor : 'transparent',
            }}
            initial={{opacity:0}} // Handled by App.tsx AnimatePresence, but good for standalone
            animate={{opacity:1}}
            exit={{opacity:0, transition: {duration: 0.3}}}
        >
            {/* Scene Specific Background (renders on top of App's global background) */}
            {currentBgVideoUrl && (
                <motion.video src={currentBgVideoUrl} autoPlay muted loop playsInline style={styles.backgroundMedia} key={`scene-bgvid-${currentBgVideoUrl}`} />
            )}
            {!currentBgVideoUrl && currentBgImageUrl && (
                 <motion.img src={currentBgImageUrl} alt="" style={styles.backgroundMedia} key={`scene-bgimg-${currentBgImageUrl}`} loading="lazy" />
            )}
            {/* Scene Specific Overlay */}
            {enableOverlay && overlayColor && <div style={{...styles.overlay, backgroundColor: overlayColor}} />}

            <div style={styles.effectsLayer}>
                 <ParticleSystem count={100} systemSeed={`pinkquiz-particles-${sceneId}`} particleBaseColor="hsl(20, 100%, 70%)" glowOpacity={0.3} />
            </div>

            <div style={styles.decorLayer}>
                <AnimatedAsset src="/images/decor-squiggle-pink.png" delaySeconds={decorBaseDelayS} top="0%" right="0%" width="clamp(100px, 25vw, 180px)" initialRotation={-5} initialX="-50%" style={{transform: 'translateX(-50%)'}} />
                <AnimatedAsset src="/images/decor-arrow-black.png" delaySeconds={decorBaseDelayS + decorStaggerS * 1} top="28%" right="0%" width="clamp(40px, 10vw, 80px)" initialRotation={-120} initialY={-20} />
                <AnimatedAsset src="/images/decor-star-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 2} top="60%" right="-5%" width="clamp(80px, 20vw, 150px)" initialRotation={20} initialX={30} />
                <AnimatedAsset src="/images/decor-lightning-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 3} bottom="clamp(30px, 20vh, 300px)" left="-10%" width="clamp(100px, 22vw, 180px)" initialRotation={15} initialX={40} initialY={20}/>
            </div>

            <div style={styles.topBar}>
                <motion.div variants={UIVariant(0.1, -20, 0.9, 0.4)} initial="initial" animate="animate">
                    {logoUrl && <img src={logoUrl} style={styles.logoImage} alt="Logo" />}
                </motion.div>
                <motion.div style={styles.timerContainer} variants={UIVariant(0.15, -20, 0.9, 0.4)} initial="initial" animate="animate">
                    {effectiveTimer > 0 && <CircularTimer remainingSeconds={timeLeft} totalDurationSeconds={effectiveTimer} size={Math.min(window.innerWidth*0.12, 60)} strokeWidth={Math.min(window.innerWidth*0.012, 6)} progressColor={themeYellow} />}
                </motion.div>
            </div>

            <div style={styles.contentArea}>
                <motion.div style={styles.titleBlock} variants={UIVariant(0.2, 20, 0.9)} initial="initial" animate="animate">
                    {mainTitle && <div style={styles.mainTitleText}>{mainTitle}</div>}
                    {difficulty && <div style={styles.difficultyText}>{difficulty}</div>}
                </motion.div>

                <motion.div style={styles.questionBox} variants={UIVariant(0.3, 20, 0.9)} initial="initial" animate="animate">
                    {referenceImageUrl && (
                        <motion.div style={styles.questionImageContainer} variants={UIVariant(0.05, 10, 0.95, 0.4)} initial="initial" animate="animate">
                            <img src={referenceImageUrl} style={styles.questionImage} alt="Question context"/>
                        </motion.div>
                    )}
                    {questionText && (
                        <motion.div style={styles.questionTextBelowImage} variants={UIVariant(0.1, 10, 0.95, 0.4)} initial="initial" animate="animate">
                            {questionText}
                        </motion.div>
                    )}
                </motion.div>

                {effectiveTimer > 0 &&
                    <motion.div style={styles.progressBarContainer} variants={UIVariant(0.35, 15, 0.9)} initial="initial" animate="animate">
                        <ProgressBar progress={timerProg} fillColor={progressBarFill} backgroundColor={progressBarBg} height={Math.min(window.innerWidth * 0.025, 15)} />
                    </motion.div>
                }

                <motion.div style={styles.optionsBox} variants={UIVariant(0.4, 20, 0.9)} initial="initial" animate="animate">
                     {options.map((opt, i) => {
                        const isCorrectOpt = opt.id === correctAnswerId;
                        const isSelectedOpt = opt.id === selectedId;
                        let dynamicButtonStyle: React.CSSProperties = {};
                        let dynamicTextStyle: React.CSSProperties = {};

                        if (isRevealing && answered) {
                            if (isCorrectOpt) {
                                dynamicButtonStyle = styles.correctOptionStyle;
                                dynamicTextStyle = styles.correctOptionTextStyle;
                            } else if (isSelectedOpt) { // Incorrectly selected
                                dynamicButtonStyle = { ...styles.incorrectOptionStyle, outline: `max(2px,0.4vw) solid #e74c3c` }; // Red outline for wrong selected
                            } else { // Other incorrect, not selected
                                dynamicButtonStyle = styles.incorrectOptionStyle;
                            }
                        }
                        return (
                             <motion.button
                                key={opt.id} style={{ ...styles.optionButton, ...dynamicButtonStyle }}
                                onClick={() => handleSelect(opt.id)} disabled={answered}
                                variants={UIVariant(0.05 * i, 10, 0.95, 0.3)}
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
                <motion.div style={styles.crewImageContainer} variants={UIVariant(0.5, 50, 0.9)} initial="initial" animate="animate">
                    <img src={crewImageUrl} style={styles.crewImage} alt="Decorative crew"/>
                </motion.div>
            }
            <audio ref={tickAudioRef} src="/audio/ticking.mp3" preload="auto" /> {/* Removed loop, handled in JS */}
            <audio ref={revealAudioRef} src="/audio/reveal.mp3" preload="auto" />
        </motion.div>
    );
};