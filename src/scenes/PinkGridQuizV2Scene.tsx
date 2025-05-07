// src/scenes/PinkGridQuizV2Scene.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PinkGridQuizV2Props } from '../types/quizDataSchema';

import { AnimatedAsset } from '../components/AnimatedAsset';
import { CircularTimer } from '../components/CircularTimer';
import { ProgressBar } from '../components/ProgressBar';
import { ParticleSystem } from '../components/Particles';
// import { SpeedLines } from '../components/SpeedLines'; // Uncomment if used

// --- Fonts ---
const titleFont = '"Bangers", Impact, fantasy, sans-serif';
const subTitleFont = '"Poppins", sans-serif';
const questionFont = '"Poppins", sans-serif';
const optionFont = '"Poppins", sans-serif';

// --- Colors ---
const themeYellow = '#ffd700';
const themePink = '#ff8fab'; // Not directly used but noted
const textColorDark = '#333';
const textColorLight = 'white';
const outlineColor = 'black';
const correctBgColor = '#66bb6a'; // Green for correct
const correctBgGradientEnd = '#43a047'; // Not used directly, but related to correct style
const defaultSceneBgColor = '#a7c7e7';

// --- Define CONSTANTS for dynamic styles used outside the 'styles' object ---
const progressBarFill = `linear-gradient(90deg, ${themeYellow} 0%, #ffeb7e 100%)`;
const progressBarBg = 'rgba(0, 0, 0, 0.2)';


// --- Styles (Revised for closer match & responsiveness) ---
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: {
        position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        backgroundColor: defaultSceneBgColor, // Fallback if no BG prop passed
    },
    backgroundMedia: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
    overlay: { position: 'absolute', inset: 0, zIndex: 1 }, // BG elements are zIndex 0
    effectsLayer: { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' },
    decorLayer: { position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' },

    contentArea: {
        position: 'relative', // For z-indexing within
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between', // Distribute space vertically
        padding: 'clamp(10px, 2vw, 20px)',
        paddingTop: 'clamp(60px, 12vh, 100px)', // Space for logo/timer
        paddingBottom: 'clamp(100px, 20vh, 180px)', // Space for crew image
        boxSizing: 'border-box',
        zIndex: 5,
        gap: 'clamp(10px, 1.5vh, 15px)', // Gap between main content blocks
    },

    topBar: {
        position: 'absolute',
        top: 'clamp(10px, 2vh, 20px)',
        left: 'clamp(10px, 2vw, 20px)',
        right: 'clamp(10px, 2vw, 20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10, // Above other content
    },
    logoImage: {
        width: 'clamp(100px, 25vw, 180px)', // Adjusted size
        height: 'auto',
        objectFit: 'contain',
        filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))',
    },
    timerContainer: {
        // Positioned by topBar flex
    },

    titleBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '90%',
        maxWidth: '450px',
        // marginTop: 'clamp(-30px, -5vh, 0px)', // Removed negative margin, rely on space-between
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
        paddingTop: 'clamp(5px, 1vh, 10px)',
        color: textColorLight,
        fontWeight: 'bold',
        textShadow: `-1.5px -1.5px 0 ${outlineColor}, 1.5px -1.5px 0 ${outlineColor}, -1.5px 1.5px 0 ${outlineColor}, 1.5px 1.5px 0 ${outlineColor}, 2px 2px 3px rgba(0,0,0,0.3)`,
        lineHeight: 1,
        whiteSpace: 'pre-line', // For titleText prop splitting
        zIndex: 0,
    },

    questionBox: {
        width: '85%', maxWidth: '480px',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 'clamp(20px, 3vw, 30px)',
        border: `max(3px, 0.6vw) solid ${outlineColor}`,
        boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`,
        padding: 'clamp(10px, 2vw, 20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 'clamp(8px, 1.5vh, 12px)',
        minHeight: 'clamp(100px, 20vh, 180px)', // Ensure minimum height
    },
    questionImageContainer: {
        width: '100%',
        aspectRatio: '16/10', // Adjust as needed for typical image aspect
        maxHeight: 'clamp(150px, 30vh, 250px)',
        borderRadius: 'clamp(10px, 1.5vw, 15px)',
        border: `max(2px, 0.4vw) solid ${outlineColor}`,
        overflow: 'hidden', // Clip image to rounded border
    },
    questionImage: { width: '100%', height: '100%', objectFit: 'cover' }, // Use cover to fill
    questionTextBelowImage: { // For optional text below image in PinkGridQuizV2
        fontFamily: questionFont, fontSize: 'clamp(14px, 3vw, 26px)',
        fontWeight: '600', color: textColorDark, textAlign: 'center',
        width: '95%', whiteSpace: 'pre-line', lineHeight: 1.2,
    },

    progressBarContainer: {
        width: '70%', maxWidth: '350px',
        margin: '0 auto', // Centered, gap handled by contentArea
    },

    optionsBox: {
        width: '90%', maxWidth: '500px',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 'clamp(20px, 3vw, 30px)',
        border: `max(3px, 0.6vw) solid ${outlineColor}`,
        boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`,
        padding: 'clamp(15px, 2.5vw, 25px)',
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'clamp(10px, 2vw, 15px)',
    },
    optionButton: {
        backgroundColor: themeYellow, // Solid yellow, no gradient for this style
        borderRadius: 'clamp(12px, 2vw, 20px)',
        border: `max(2.5px, 0.5vw) solid ${outlineColor}`,
        boxShadow: `max(3px, 0.6vw) max(3px, 0.6vw) 0px ${outlineColor}`, // 3D border
        padding: 'clamp(8px, 1.5vh, 15px)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start', // Align label and text
        minHeight: 'clamp(45px, 8vh, 70px)',
        transition: 'transform 0.1s ease-out, background-color 0.2s, opacity 0.2s',
        cursor: 'pointer',
    },
    optionLabel: {
        fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)',
        fontWeight: '900', color: textColorDark, // Dark text on yellow
        minWidth: 'clamp(25px, 5vw, 40px)', textAlign: 'center',
        marginRight: 'clamp(5px, 1vw, 10px)',
        textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
    },
    optionText: {
        fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)',
        fontWeight: 'bold', color: textColorDark, // Dark text on yellow
        flexGrow: 1, textAlign: 'left',
        textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
        whiteSpace: 'pre-line', lineHeight: 1.1,
    },
    // Style applied to the entire button when correct
    correctOptionStyle: {
        backgroundColor: correctBgColor,
        // Children text color will be overridden below
    },
     // Style applied *only* to text elements inside the correct button
    correctOptionTextStyle: {
        color: textColorLight,
        textShadow: `1px 1px 0px rgba(0,0,0,0.3)`
    },
    incorrectOptionStyle: {
        opacity: 0.6,
        transform: 'scale(0.97)',
        filter: 'grayscale(30%)'
    },

    crewImageContainer: {
        position: 'absolute', bottom: 0, left: 0, width: '100%',
        height: `clamp(120px, 22vh, 200px)`, // Adjusted size
        zIndex: 4, // Above BG, below content typically
        overflow: 'hidden',
        maskImage: 'linear-gradient(to top, black 20%, transparent 100%)', // Sharper mask
        WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
        pointerEvents: 'none',
    },
    crewImage: {
        display: 'block', position: 'absolute', bottom: '-10%', // Pull down slightly for better crop
        height: '100%', width: '100%', left: '0%',
        objectFit: 'contain', objectPosition: 'center bottom',
    },
};

// Framer Motion Variants
const UIVariant = (delay = 0, yStart = 15, scaleStart = 0.9, duration = 0.5) => ({
  initial: { opacity: 0, y: yStart, scale: scaleStart },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 130, delay, duration } },
  exit: { opacity: 0, y: yStart, scale: scaleStart, transition: { duration: 0.25 } }
});

interface SceneProps extends PinkGridQuizV2Props {
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
    globalBackgroundImageUrl?: string | null; // Received from App
    globalBackgroundVideoUrl?: string | null; // Received from App
    backgroundVideoUrl?: string | null; // Scene specific BG (overrides global)
    backgroundImageUrl?: string | null; // Scene specific BG (overrides global)
}

export const PinkGridQuizV2Scene: React.FC<SceneProps> = ({
    sceneId, titleText = "GUESS THE CHARACTER\nDIFFICULTY: EASY", // Updated default
    questionText, options, referenceImageUrl, correctAnswerId, timerDuration,
    durationInSeconds, onSceneEnd, backgroundUrl, backgroundVideoUrl, enableOverlay, overlayColor,
    crewImageUrl, logoUrl = "/images/anime-logo-placeholder.png",
    globalBackgroundImageUrl, globalBackgroundVideoUrl, // These are passed from App for potential use
    // Use scene-specific BGs passed via props if available, otherwise App handles global
    backgroundImageUrl: sceneBackgroundImageUrl, // Rename to avoid conflict
    backgroundVideoUrl: sceneBackgroundVideoUrl,
}) => {
    const effectiveTimer = timerDuration ?? 5;
    const [timeLeft, setTimeLeft] = useState(effectiveTimer);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const tickAudioRef = useRef<HTMLAudioElement>(null);
    const revealAudioRef = useRef<HTMLAudioElement>(null);

    // Scene End & Timer Logic (robust version)
    useEffect(() => {
        let sceneEndTimeoutId: NodeJS.Timeout | undefined;
        if (isRevealing && answered) {
            sceneEndTimeoutId = setTimeout(() => {
                onSceneEnd({ sceneId, isCorrect: selectedId === correctAnswerId });
            }, 3000);
        } else if (!answered) {
             sceneEndTimeoutId = setTimeout(() => {
                if (!answered) { // Re-check in case answered during timeout
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
            try {
                if (tickAudioRef.current) {
                    tickAudioRef.current.currentTime = 0;
                    await tickAudioRef.current.play();
                }
            } catch (e) { console.warn("Tick audio failed", e); }
        };
        playTick();
        return () => {
            clearInterval(intervalId);
            tickAudioRef.current?.pause();
        };
    }, [timeLeft, answered]);


    const handleSelect = (id: string) => {
        if (answered) return;
        setSelectedId(id);
        setAnswered(true);
        setIsRevealing(true);
        revealAudioRef.current?.play().catch(e=>console.warn("Reveal audio on select failed", e));
    };

    const [mainTitle, difficulty] = titleText.split('\n');
    const timerProg = Math.max(0, Math.min(1, timeLeft / effectiveTimer));

    // Determine effective background source for THIS scene
    // Props passed directly to the component override globals
    const currentBgVideoUrl = sceneBackgroundVideoUrl;
    const currentBgImageUrl = sceneBackgroundImageUrl || backgroundUrl; // Allow legacy 'backgroundUrl'

    const decorBaseDelayS = 0.2; const decorStaggerS = 0.07;

    return (
        <motion.div
            style={{
                ...styles.sceneRoot,
                // Apply scene-specific background color if no image/video is used
                backgroundColor: (!currentBgVideoUrl && !currentBgImageUrl) ? defaultSceneBgColor : undefined,
            }}
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0, transition: {duration: 0.3}}}
        >
            {/* Scene Specific Background (if provided) */}
            {currentBgVideoUrl && (
                <video src={currentBgVideoUrl} autoPlay muted loop playsInline style={styles.backgroundMedia} key={`scene-bgvid-${currentBgVideoUrl}`} />
            )}
            {!currentBgVideoUrl && currentBgImageUrl && (
                 <img src={currentBgImageUrl} alt="" style={styles.backgroundMedia} key={`scene-bgimg-${currentBgImageUrl}`} loading="lazy" />
            )}
            {/* Scene Specific Overlay (if provided) */}
            {enableOverlay && overlayColor && <div style={{...styles.overlay, backgroundColor: overlayColor}} />}

            {/* Effects Layer */}
            <div style={styles.effectsLayer}>
                 <ParticleSystem count={100} systemSeed={`pinkquiz-particles-${sceneId}`} particleBaseColor="hsl(20, 100%, 70%)" glowOpacity={0.3} />
                 {/* SpeedLines could be added here */}
            </div>

            {/* Decorative Assets Layer */}
            <div style={styles.decorLayer}>
                <AnimatedAsset src="/images/decor-squiggle-pink.png" delaySeconds={decorBaseDelayS} top="0%" right="0%" width="clamp(100px, 25vw, 180px)" initialRotation={-5} initialX="-50%" style={{transform: 'translateX(-50%)'}} />
                <AnimatedAsset src="/images/decor-arrow-black.png" delaySeconds={decorBaseDelayS + decorStaggerS * 1} top="28%" right="0%" width="clamp(40px, 10vw, 80px)" initialRotation={-120} initialY={-20} />
                <AnimatedAsset src="/images/decor-star-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 2} top="60%" right="-5%" width="clamp(80px, 20vw, 150px)" initialRotation={20} initialX={30} />
                <AnimatedAsset src="/images/decor-lightning-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 3} bottom="clamp(30px, 200vh, 300px)" left="-10%" width="clamp(100px, 22vw, 180px)" initialRotation={15} initialX={40} initialY={20}/>
                 {/* Add more assets if needed */}
            </div>

            {/* Top Bar fixed */}
            <div style={styles.topBar}>
                <motion.div variants={UIVariant(0.1, -20, 0.9, 0.4)} initial="initial" animate="animate">
                    {logoUrl && <img src={logoUrl} style={styles.logoImage} alt="Logo" />}
                </motion.div>
                <motion.div style={styles.timerContainer} variants={UIVariant(0.15, -20, 0.9, 0.4)} initial="initial" animate="animate">
                    {effectiveTimer > 0 && <CircularTimer remainingSeconds={timeLeft} totalDurationSeconds={effectiveTimer} size={Math.min(window.innerWidth*0.1, 50)} strokeWidth={Math.min(window.innerWidth*0.01, 5)} progressColor={themeYellow} />}
                </motion.div>
            </div>

             {/* Main Content Area (scrollable if needed, but layout aims to fit) */}
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
                    {questionText && ( // Optional text below image for V2
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
                        let dynamicTextStyle: React.CSSProperties = {}; // Combined style for label & text

                        if (isRevealing && answered) {
                            if (isCorrectOpt) {
                                dynamicButtonStyle = styles.correctOptionStyle;
                                dynamicTextStyle = styles.correctOptionTextStyle;
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
                                // Apply variant to each button for staggered entry
                                variants={UIVariant(0.05 * i, 10, 0.95, 0.3)}
                                initial="initial" // Start hidden based on variant
                                animate="animate" // Animate in based on variant
                                whileHover={!answered ? { scale: 1.03, filter:'brightness(1.1)' } : {}}
                                whileTap={!answered ? { scale: 0.97 } : {}}>
                                <span style={{...styles.optionLabel, ...dynamicTextStyle}}>{opt.id}.</span>
                                <span style={{...styles.optionText, ...dynamicTextStyle}}>{opt.text}</span>
                            </motion.button>
                        );
                    })}
                </motion.div>
                {/* Optional Spacer if needed */}
                {/* <div style={{flexGrow: 1}} /> */}
            </div>

            {/* Crew Image Layer */}
            {crewImageUrl &&
                <motion.div style={styles.crewImageContainer} variants={UIVariant(0.5, 50, 0.9)} initial="initial" animate="animate">
                    <img src={crewImageUrl} style={styles.crewImage} alt="Decorative crew"/>
                </motion.div>
            }
            {/* Audio Elements */}
            <audio ref={tickAudioRef} src="/audio/ticking.mp3" loop preload="auto" />
            <audio ref={revealAudioRef} src="/audio/reveal.mp3" preload="auto" />
        </motion.div>
    );
};