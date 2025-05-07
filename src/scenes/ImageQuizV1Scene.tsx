// src/scenes/ImageQuizV1Scene.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { QnaImageQuizV1Props, QnaImageOption } from '../types/quizDataSchema'; // Ensure correct import path

import { CircularTimer } from '../components/CircularTimer';
import { ProgressBar } from '../components/ProgressBar';
import { ParticleSystem } from '../components/Particles';
// import { SpeedLines } from '../components/SpeedLines'; // Uncomment if you migrate and want to use SpeedLines

// --- Fonts (from original Remotion component) ---
const questionFontFamily = '"Luckiest Guy", Impact, fantasy, sans-serif';
const optionTextFontFamily = "'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif";
const optionLabelFontFamily = 'Impact, fantasy, sans-serif';
const defaultSceneBgColor = '#6a11cb'; // Dark purple from original

// --- Styles (adapted for web) ---
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: defaultSceneBgColor },
    backgroundMedia: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
    overlay: { position: 'absolute', inset: 0, zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
    effectsLayer: { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' },

    frameContainer: { 
        position: 'absolute', top: '3%', left: '3%', right: '3%', bottom: '3%', 
        backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: 'clamp(20px, 5vw, 40px)', 
        border: 'clamp(4px, 1vw, 8px) solid rgba(255, 255, 255, 0.35)', 
        boxShadow: '0 clamp(5px, 2vh, 15px) clamp(15px, 5vh, 40px) rgba(0,0,0,0.4)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        padding: 'clamp(10px, 2vw, 20px)', boxSizing: 'border-box', overflow: 'hidden', zIndex: 3
    },
    topBar: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(5px, 1.5vh, 15px)', padding: '0 clamp(5px, 1vw, 15px)', flexShrink: 0 },
    logoImage: { height: 'clamp(40px, 10vh, 80px)', width: 'auto', maxWidth: 'clamp(100px, 30vw, 200px)', objectFit: 'contain', borderRadius: '10px' },
    
    questionWrapper: {
        width: '95%', maxWidth: '600px',
        background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 20, 0.35))',
		padding: 'clamp(15px, 3vh, 25px) clamp(20px, 5vw, 40px)', borderRadius: '50px', 
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255, 255, 255, 0.15)', borderBottomWidth: '4px', borderBottomColor: 'rgba(255,255,255,0.3)',
		textAlign: 'center', flexShrink: 0, marginTop: 'clamp(5px, 1vh, 15px)', marginBottom: 'auto'
    },
	questionText: { fontFamily: questionFontFamily, fontSize: 'clamp(24px, 6vw, 52px)', fontWeight: 'bold', color: 'white', lineHeight: 1.3, margin: 0, textShadow: '3px 3px 0px rgba(0,0,0,0.5), 0 0 5px rgba(0,0,0,0.3)', whiteSpace: 'pre-line' },
    highlightedWord: { color: '#f1c40f', display: 'inline-block', filter: 'brightness(1.1)', fontWeight: 'bolder', textShadow: 'inherit' },

    bottomArea: { width: '100%', marginTop: 'auto', marginBottom: 'clamp(5px, 1vh, 10px)', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(10px, 2vh, 20px)' },
    optionsContainer: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: 'clamp(10px, 2.5vw, 25px)', flexWrap: 'wrap', padding: '0 clamp(5px, 1vw, 15px)' },
    optionCard: { 
        flexBasis: 'calc(50% - clamp(5px, 1.25vw, 12.5px))', 
        maxWidth: 'calc(50% - clamp(5px, 1.25vw, 12.5px))', 
        minHeight: 'clamp(150px, 35vw, 280px)', 
        backgroundColor: 'white', borderRadius: 'clamp(15px, 3vw, 30px)', 
        padding: 'clamp(10px, 1.5vw, 15px)', paddingTop: 'clamp(20px, 4vw, 35px)', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.25)', border: 'clamp(3px, 0.8vw, 6px) solid #d1d5db', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', 
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.3s, filter 0.3s, opacity 0.3s', 
        position: 'relative', overflow: 'visible', cursor: 'pointer' 
    },
	optionLabel: { 
        position: 'absolute', top: 'calc(clamp(25px, 5vw, 35px) * -0.5)', left: '50%', transform: 'translateX(-50%)', 
        backgroundColor: '#34495e', color: 'white', borderRadius: '50%', 
        width: 'clamp(35px, 8vw, 60px)', height: 'clamp(35px, 8vw, 60px)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: 'clamp(18px, 4vw, 35px)', fontWeight: 'bold', border: 'clamp(2px, 0.5vw, 4px) solid white',
        fontFamily: optionLabelFontFamily, zIndex: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    },
	optionImageWrapper: { width: '100%', aspectRatio: '1 / 1', marginBottom: 'clamp(5px, 1vh, 10px)', borderRadius: 'clamp(10px, 2vw, 20px)', overflow: 'hidden', backgroundColor: '#f0f0f0', flexShrink: 0 },
	optionImage: { display: 'block', width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease-out' },
	optionText: { fontFamily: optionTextFontFamily, fontSize: 'clamp(14px, 3vw, 28px)', fontWeight: 'bold', color: '#34495e', marginTop: 'auto', lineHeight: 1.2, width: '100%', padding: 'clamp(3px, 0.5vh, 5px)', whiteSpace: 'pre-line' },
	
    progressBarContainer: { width: '90%', maxWidth: '500px', display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingBottom: 'clamp(5px, 1vh, 10px)' },
    
    correctOptionStyle: { borderColor: '#27ae60', borderWidth: 'clamp(4px, 0.9vw, 7px)', boxShadow: '0 0 clamp(10px, 3vw, 25px) #2ecc71' },
    incorrectOptionStyle: { opacity: 0.55, filter: 'grayscale(60%)', transform: 'scale(0.96)' },
};

// Framer Motion Variants
const UIVariant = (delay = 0, yStart = 20, scaleStart = 0.9, duration = 0.5) => ({
  initial: { opacity: 0, y: yStart, scale: scaleStart },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 130, delay, duration } },
  exit: { opacity: 0, y: yStart, scale: scaleStart, transition: { duration: 0.25 } }
});


interface SceneProps extends QnaImageQuizV1Props { // Use the correct props from schema
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
    globalBackgroundImageUrl?: string | null; globalBackgroundVideoUrl?: string | null;
}

export const ImageQuizV1Scene: React.FC<SceneProps> = ({
    sceneId, questionText, options, timerDuration, correctAnswerId,
    durationInSeconds, onSceneEnd, backgroundImageUrl, backgroundVideoUrl, enableOverlay, overlayColor,
    logoUrl = "/images/oplogo.png", // Default logo from original for this theme
    globalBackgroundImageUrl, globalBackgroundVideoUrl,
}) => {
    const effectiveTimer = timerDuration ?? 10;
    const [timeLeft, setTimeLeft] = useState(effectiveTimer);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const tickAudioRef = useRef<HTMLAudioElement>(null);
    const revealAudioRef = useRef<HTMLAudioElement>(null);

    // Scene End Logic
    useEffect(() => {
        let sceneEndTimeoutId: NodeJS.Timeout;
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

    // Question Timer Logic
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
        tickAudioRef.current?.play().catch(e => console.warn("Tick audio failed", e));
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

    // From original Remotion component
    const processQuestionText = (text: string) => {
        return text.split(/(\b[A-Z]{2,}\b)/g).map((part, i) =>
            /^[A-Z]{2,}$/.test(part)
                ? <span key={i} style={styles.highlightedWord}>{part}</span>
                : part
        );
    };
    
    const timerProg = Math.max(0, Math.min(1, timeLeft / effectiveTimer));
    const currentBgVideoUrl = backgroundVideoUrl !== undefined ? backgroundVideoUrl : globalBackgroundVideoUrl;
    const currentBgImageUrl = backgroundImageUrl !== undefined ? backgroundImageUrl : globalBackgroundImageUrl;

    // Helper to determine if on a touch device for hover states
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    return (
        <motion.div style={styles.sceneRoot} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0, transition: {duration: 0.3}}}>
            {currentBgVideoUrl && <video src={currentBgVideoUrl} autoPlay muted loop style={styles.backgroundMedia} key={`bgvid_${currentBgVideoUrl}`} />}
            {!currentBgVideoUrl && currentBgImageUrl && <img src={currentBgImageUrl} alt="background" style={styles.backgroundMedia} key={`bgimg_${currentBgImageUrl}`} />}
            {(enableOverlay === undefined || enableOverlay) && <div style={{...styles.overlay, backgroundColor: overlayColor || 'rgba(0,0,0,0.55)'}} />}

            <div style={styles.effectsLayer}>
                <ParticleSystem count={70} systemSeed={`imagequiz-particles-${sceneId}`} particleBaseColor="hsl(0, 0%, 90%)" glowOpacity={0.3} />
                {/* <SpeedLines count={30} seed={`imagequiz-lines-${sceneId}`} color="rgba(255,255,255,0.2)" /> */}
            </div>
            
            <motion.div style={styles.frameContainer} variants={UIVariant(0, 30, 0.85, 0.6)} initial="initial" animate="animate">
                <motion.div style={styles.topBar} variants={UIVariant(0.1, 15, 0.9, 0.5)} initial="initial" animate="animate">
                    <CircularTimer 
                        remainingSeconds={timeLeft} 
                        totalDurationSeconds={effectiveTimer} 
                        size={Math.min(window.innerWidth * 0.12, 90)} // Responsive size
                        strokeWidth={Math.min(window.innerWidth * 0.018, 10)}
                        progressColor='#f1c40f' 
                        trackColor='rgba(0,0,0,0.25)' 
                        innerBackgroundColor='rgba(0,0,0,0.45)' 
                        textColor='#ffffff'
                    />
                    {logoUrl && <img src={logoUrl} style={styles.logoImage} alt="Logo"/>}
                </motion.div>

                <motion.div style={styles.questionWrapper} variants={UIVariant(0.2, 20, 0.9, 0.5)} initial="initial" animate="animate">
                    <h1 style={styles.questionText}>{processQuestionText(questionText)}</h1>
                </motion.div>
                
                <div style={styles.bottomArea}>
                    <motion.div style={styles.optionsContainer} variants={UIVariant(0.3, 25, 0.9, 0.5)} initial="initial" animate="animate">
                        {options.map((opt, i) => {
                            const isCorrectOpt = opt.id === correctAnswerId;
                            const isSelectedOpt = opt.id === selectedId;
                            let dynamicCardStyle: React.CSSProperties = {};
                            let imageZoom = 1;

                            if (isRevealing && answered) {
                                if (isCorrectOpt) { 
                                    dynamicCardStyle = styles.correctOptionStyle; 
                                    imageZoom = 1.08; // Zoom effect for correct answer's image
                                }
                                else if (isSelectedOpt) { dynamicCardStyle = { ...styles.incorrectOptionStyle, outline: 'max(2px,0.4vw) solid #e74c3c' };} // Red outline for selected wrong
                                else { dynamicCardStyle = styles.incorrectOptionStyle; }
                            }
                            return (
                                <motion.button
                                    key={opt.id} style={{ ...styles.optionCard, ...dynamicCardStyle }}
                                    onClick={() => handleSelect(opt.id)} disabled={answered}
                                    variants={UIVariant(0.05 * i, 10, 0.95, 0.4)} // Staggered animation for each option
                                    whileHover={!answered && !isTouchDevice ? { scale: 1.02, y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.35)' } : {}}
                                    whileTap={!answered ? { scale: 0.98 } : {}}>
                                    <div style={{...styles.optionLabel, backgroundColor: (isRevealing && answered && isCorrectOpt) ? '#2ecc71' : '#34495e' }}>{opt.id}</div>
                                    <div style={styles.optionImageWrapper}>
                                        <motion.img 
                                            src={opt.imageUrl} 
                                            style={styles.optionImage} 
                                            alt={`Option ${opt.text || opt.id}`} 
                                            animate={{ scale: imageZoom }} 
                                            transition={{duration:0.3, type: 'spring', stiffness: 200, damping: 10}}
                                            onError={(e) => console.error("Failed to load image:", (e.target as HTMLImageElement).src)}
                                        />
                                    </div>
                                    {opt.text && <div style={styles.optionText}>{opt.text}</div>}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                    
                    <motion.div style={styles.progressBarContainer} variants={UIVariant(0.4, 15, 0.9, 0.5)} initial="initial" animate="animate">
                        <ProgressBar 
                            progress={timerProg} 
                            height={Math.min(window.innerWidth * 0.045, 30)} 
                            borderRadius={Math.min(window.innerWidth * 0.0225, 15)} 
                            fillColor='linear-gradient(90deg, #3498db 0%, #2980b9 100%)' 
                            backgroundColor='rgba(0,0,0,0.3)' 
                        />
                    </motion.div>
                </div>
            </motion.div>
            <audio ref={tickAudioRef} src="/audio/ticking.mp3" loop preload="auto" />
            <audio ref={revealAudioRef} src="/audio/reveal.mp3" preload="auto" />
        </motion.div>
    );
};