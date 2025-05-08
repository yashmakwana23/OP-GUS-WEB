// src/scenes/PinkGridQuizV2Scene.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PinkGridQuizV2Props } from '../types/quizDataSchema';
import { AnimatedAsset } from '../components/AnimatedAsset';
import { CircularTimer } from '../components/CircularTimer';
import { ProgressBar } from '../components/ProgressBar';
import { ParticleSystem } from '../components/Particles';

// Styles and constants (omitted for brevity, assumed same as your last working version)
const styles: Record<string, React.CSSProperties> = { /* ... */ };
const titleFont = '"Bangers", Impact, fantasy, sans-serif';
const subTitleFont = '"Poppins", sans-serif';
const questionFont = '"Poppins", sans-serif';
const optionFont = '"Poppins", sans-serif';
const themeYellow = '#ffd700';
const textColorDark = '#333';
const textColorLight = 'white';
const outlineColor = 'black';
const correctBgColor = '#66bb6a';
const defaultSceneBgColor = '#a7c7e7';
const progressBarFill = `linear-gradient(90deg, ${themeYellow} 0%, #ffeb7e 100%)`;
const progressBarBg = 'rgba(0, 0, 0, 0.2)';
// ... (rest of styles object from your file)
styles.sceneRoot = {
    position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    // backgroundColor: defaultSceneBgColor, // Scene BG is handled by its own image/video or App's global BG
};
styles.backgroundMedia = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 };
styles.overlay = { position: 'absolute', inset: 0, zIndex: 1 }; 
styles.effectsLayer = { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' };
styles.decorLayer = { position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' };
styles.contentArea = {
    position: 'relative', width: '100%', height: '100%', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
    padding: 'clamp(10px, 2vw, 20px)', paddingTop: 'clamp(60px, 12vh, 100px)',
    paddingBottom: 'clamp(100px, 20vh, 180px)', boxSizing: 'border-box', zIndex: 5,
    gap: 'clamp(10px, 1.5vh, 15px)',
};
styles.topBar = {
    position: 'absolute', top: 'clamp(10px, 2vh, 20px)', left: 'clamp(10px, 2vw, 20px)',
    right: 'clamp(10px, 2vw, 20px)', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', zIndex: 10,
};
styles.logoImage = {
    width: 'clamp(100px, 25vw, 180px)', height: 'auto', objectFit: 'contain',
    filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))',
};
styles.timerContainer = {};
styles.titleBlock = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    width: '90%', maxWidth: '450px',
};
styles.mainTitleText = { 
    fontFamily: titleFont, fontSize: 'clamp(28px, 7vw, 50px)', color: textColorDark,
    backgroundColor: themeYellow, padding: 'clamp(5px, 1vh, 10px) clamp(15px, 4vw, 30px)',
    borderRadius: 'clamp(8px, 1.5vw, 12px)', border: `max(2px, 0.3vw) solid ${outlineColor}`,
    boxShadow: `max(3px, 0.5vw) max(3px, 0.5vw) 0px ${outlineColor}`, 
    textShadow: '1px 1px 1px rgba(255,255,255,0.3)', lineHeight: 1.1, zIndex: 1,
    marginBottom: '-clamp(5px, 1vh, 10px)', transform: 'rotate(-1deg)',
};
styles.difficultyText = {
    fontFamily: subTitleFont, fontSize: 'clamp(20px, 5vw, 36px)',
    paddingTop: 'clamp(5px, 1vh, 10px)', color: textColorLight, fontWeight: 'bold',
    textShadow: `-1.5px -1.5px 0 ${outlineColor}, 1.5px -1.5px 0 ${outlineColor}, -1.5px 1.5px 0 ${outlineColor}, 1.5px 1.5px 0 ${outlineColor}, 2px 2px 3px rgba(0,0,0,0.3)`,
    lineHeight: 1, whiteSpace: 'pre-line', zIndex: 0,
};
styles.questionBox = {
    width: '85%', maxWidth: '480px', backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`,
    boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`,
    padding: 'clamp(10px, 2vw, 20px)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 'clamp(8px, 1.5vh, 12px)',
    minHeight: 'clamp(100px, 20vh, 180px)',
};
styles.questionImageContainer = {
    width: '100%', aspectRatio: '16/10', maxHeight: 'clamp(150px, 30vh, 250px)',
    borderRadius: 'clamp(10px, 1.5vw, 15px)', border: `max(2px, 0.4vw) solid ${outlineColor}`,
    overflow: 'hidden',
};
styles.questionImage = { width: '100%', height: '100%', objectFit: 'cover' };
styles.questionTextBelowImage = {
    fontFamily: questionFont, fontSize: 'clamp(14px, 3vw, 26px)', fontWeight: '600',
    color: textColorDark, textAlign: 'center', width: '95%', whiteSpace: 'pre-line',
    lineHeight: 1.2,
};
styles.progressBarContainer = { width: '70%', maxWidth: '350px', margin: '0 auto' };
styles.optionsBox = {
    width: '90%', maxWidth: '500px', backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`,
    boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`,
    padding: 'clamp(15px, 2.5vw, 25px)', display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(10px, 2vw, 15px)',
};
styles.optionButton = {
    backgroundColor: themeYellow, borderRadius: 'clamp(12px, 2vw, 20px)',
    border: `max(2.5px, 0.5vw) solid ${outlineColor}`,
    boxShadow: `max(3px, 0.6vw) max(3px, 0.6vw) 0px ${outlineColor}`,
    padding: 'clamp(8px, 1.5vh, 15px)', display: 'flex', alignItems: 'center',
    justifyContent: 'flex-start', minHeight: 'clamp(45px, 8vh, 70px)',
    transition: 'transform 0.1s ease-out, background-color 0.2s, opacity 0.2s',
    cursor: 'pointer',
};
styles.optionLabel = {
    fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: '900',
    color: textColorDark, minWidth: 'clamp(25px, 5vw, 40px)', textAlign: 'center',
    marginRight: 'clamp(5px, 1vw, 10px)', textShadow: '1px 1px 0px rgba(255,255,255,0.5)',
};
styles.optionText = {
    fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: 'bold',
    color: textColorDark, flexGrow: 1, textAlign: 'left',
    textShadow: '1px 1px 0px rgba(255,255,255,0.5)', whiteSpace: 'pre-line', lineHeight: 1.1,
};
styles.correctOptionStyle = { backgroundColor: correctBgColor };
styles.correctOptionTextStyle = { color: textColorLight, textShadow: `1px 1px 0px rgba(0,0,0,0.3)` };
styles.incorrectOptionStyle = { opacity: 0.6, transform: 'scale(0.97)', filter: 'grayscale(30%)' };
styles.crewImageContainer = {
    position: 'absolute', bottom: 0, left: 0, width: '100%',
    height: `clamp(120px, 22vh, 200px)`, zIndex: 4, overflow: 'hidden',
    maskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
    pointerEvents: 'none',
};
styles.crewImage = {
    display: 'block', position: 'absolute', bottom: '-10%', height: '100%',
    width: '100%', left: '0%', objectFit: 'contain', objectPosition: 'center bottom',
};

const UIVariant = (delay = 0, yStart = 15, scaleStart = 0.9, duration = 0.5) => ({
  initial: { opacity: 0, y: yStart, scale: scaleStart },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 130, delay, duration } },
  exit: { opacity: 0, y: yStart, scale: scaleStart, transition: { duration: 0.25 } }
});

interface SceneProps extends PinkGridQuizV2Props {
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
    backgroundImageUrl?: string | null; 
    backgroundVideoUrl?: string | null;
    globalBackgroundImageUrl?: string | null;
    globalBackgroundVideoUrl?: string | null;
}

export const PinkGridQuizV2Scene: React.FC<SceneProps> = ({
    sceneId, titleText = "GUESS THE CHARACTER\nDIFFICULTY: EASY",
    questionText, options, referenceImageUrl, correctAnswerId, timerDuration,
    durationInSeconds, onSceneEnd,
    backgroundImageUrl, backgroundVideoUrl,
    backgroundUrl: originalSchemaBackgroundUrl, 
    enableOverlay, overlayColor,
    crewImageUrl, logoUrl = "/images/anime-logo-placeholder.png",
}) => {
    const effectiveTimer = timerDuration ?? 5;
    const [timeLeft, setTimeLeft] = useState(effectiveTimer);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const tickAudioRef = useRef<HTMLAudioElement>(null);
    const revealAudioRef = useRef<HTMLAudioElement>(null);
    const hasPlayedRevealAudioRef = useRef(false); // Track if reveal audio played for this instance of reveal

    // Scene End Logic (handles revealing answers and calling onSceneEnd)
    useEffect(() => {
        let sceneEndTimeoutId: number | undefined;

        if (isRevealing && answered) {
            // Play reveal sound ONCE when revealing starts
            if (!hasPlayedRevealAudioRef.current && revealAudioRef.current?.paused) {
                revealAudioRef.current.play().catch(e => console.warn("Reveal audio failed (on reveal start)", e));
                hasPlayedRevealAudioRef.current = true;
            }
            // Set timer to call onSceneEnd after reveal duration
            sceneEndTimeoutId = setTimeout(() => {
                onSceneEnd({ sceneId, isCorrect: selectedId === correctAnswerId });
            }, 3000); // 3-second reveal time
        }
        return () => clearTimeout(sceneEndTimeoutId);
    }, [isRevealing, answered, selectedId, correctAnswerId, sceneId, onSceneEnd]);


    // Scene Duration Timer (if user doesn't answer)
    useEffect(() => {
        if (answered) return; // If already answered, this timer is irrelevant

        const timeoutId = setTimeout(() => {
            if (!answered) { // Double-check, user might answer just before timeout
                setAnswered(true);
                setIsRevealing(true);
                setSelectedId(null); // Signifies timeout, no answer selected
                // Reveal sound and onSceneEnd will be handled by the effect above
            }
        }, durationInSeconds * 1000);

        return () => clearTimeout(timeoutId);
    }, [answered, durationInSeconds]); // Only depends on these

    // Countdown Timer & Tick Sound Logic
    useEffect(() => {
        if (answered || timeLeft <= 0) { // Stop conditions
            if (tickAudioRef.current && !tickAudioRef.current.paused) {
                tickAudioRef.current.pause();
                tickAudioRef.current.currentTime = 0;
            }
            if (timeLeft <= 0 && !answered) { // Timer ran out just now
                setAnswered(true);
                setIsRevealing(true);
                setSelectedId(null);
                // Reveal sound and onSceneEnd handled by other effect
            }
            return; // Exit effect
        }

        // Interval for countdown
        const intervalId = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        // Play tick sound if conditions met
        if (tickAudioRef.current && tickAudioRef.current.paused && timeLeft > 0) {
            tickAudioRef.current.currentTime = 0; // Reset for consistent sound
            tickAudioRef.current.play().catch(e => console.warn("Tick audio failed", e));
        } else if (tickAudioRef.current?.ended) { // If it played and ended, play again next tick
             tickAudioRef.current.currentTime = 0;
             tickAudioRef.current.play().catch(e => console.warn("Tick audio failed (replay on ended)", e));
        }


        return () => {
            clearInterval(intervalId);
            // Pause tick sound if it's running when effect cleans up
            if (tickAudioRef.current && !tickAudioRef.current.paused) {
                tickAudioRef.current.pause();
                tickAudioRef.current.currentTime = 0;
            }
        };
    }, [timeLeft, answered]); // Re-run when timeLeft or answered status changes

    const handleSelect = (id: string) => {
        if (answered) return;
        setSelectedId(id);
        setAnswered(true);
        setIsRevealing(true);
        // Reveal sound and onSceneEnd are handled by the dedicated useEffect hook
        // based on isRevealing and answered state changes.
    };

    const [mainTitle, difficulty] = titleText.split('\n');
    const timerProg = effectiveTimer > 0 ? Math.max(0, Math.min(1, timeLeft / effectiveTimer)) : 0;

    const currentBgVideoUrl = backgroundVideoUrl;
    const currentBgImageUrl = backgroundImageUrl || originalSchemaBackgroundUrl;

    const decorBaseDelayS = 0.2; const decorStaggerS = 0.07;

    return (
        <motion.div
            style={{
                ...styles.sceneRoot,
                backgroundColor: (!currentBgVideoUrl && !currentBgImageUrl) ? defaultSceneBgColor : 'transparent',
            }}
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0, transition: {duration: 0.3}}}
        >
            {currentBgVideoUrl && (
                <motion.video 
                    key={`scene-bgvid-${sceneId}-${currentBgVideoUrl}`} // More specific key
                    src={currentBgVideoUrl} autoPlay muted loop playsInline style={styles.backgroundMedia} />
            )}
            {!currentBgVideoUrl && currentBgImageUrl && (
                 <motion.img 
                    key={`scene-bgimg-${sceneId}-${currentBgImageUrl}`} // More specific key
                    src={currentBgImageUrl} alt="" style={styles.backgroundMedia} loading="lazy" />
            )}
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
                            } else if (isSelectedOpt) {
                                dynamicButtonStyle = { ...styles.incorrectOptionStyle, outline: `max(2px,0.4vw) solid #e74c3c` };
                            } else {
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
            {/* Remove loop attribute from HTML; JS handles tick replay logic */}
            <audio ref={tickAudioRef} src="/audio/ticking.mp3" preload="auto" />
            <audio ref={revealAudioRef} src="/audio/reveal.mp3" preload="auto" />
        </motion.div>
    );
};