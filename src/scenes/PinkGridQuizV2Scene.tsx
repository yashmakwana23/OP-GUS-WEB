// src/scenes/PinkGridQuizV2Scene.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PinkGridQuizV2Props } from '../types/quizDataSchema';
import { AnimatedAsset } from '../components/AnimatedAsset';
import { CircularTimer } from '../components/CircularTimer';
import { ProgressBar } from '../components/ProgressBar';
import { ParticleSystem } from '../components/Particles';

// --- Fonts, Colors, Styles (Keep as is) ---
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
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent'},
    backgroundMedia: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
    overlay: { position: 'absolute', inset: 0, zIndex: 1 },
    effectsLayer: { position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' },
    decorLayer: { position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' },
    contentArea: { position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(10px, 2vw, 20px)', paddingTop: 'clamp(60px, 12vh, 100px)', paddingBottom: 'clamp(100px, 20vh, 180px)', boxSizing: 'border-box', zIndex: 5, gap: 'clamp(10px, 1.5vh, 15px)'},
    topBar: { position: 'absolute', top: 'clamp(10px, 2vh, 20px)', left: 'clamp(10px, 2vw, 20px)', right: 'clamp(10px, 2vw, 20px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10},
    logoImage: { width: 'clamp(100px, 25vw, 180px)', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))'},
    timerContainer: {},
    titleBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '90%', maxWidth: '450px'},
    mainTitleText: { fontFamily: titleFont, fontSize: 'clamp(28px, 7vw, 50px)', color: textColorDark, backgroundColor: themeYellow, padding: 'clamp(5px, 1vh, 10px) clamp(15px, 4vw, 30px)', borderRadius: 'clamp(8px, 1.5vw, 12px)', border: `max(2px, 0.3vw) solid ${outlineColor}`, boxShadow: `max(3px, 0.5vw) max(3px, 0.5vw) 0px ${outlineColor}`, textShadow: '1px 1px 1px rgba(255,255,255,0.3)', lineHeight: 1.1, zIndex: 1, marginBottom: '-clamp(5px, 1vh, 10px)', transform: 'rotate(-1deg)'},
    difficultyText: { fontFamily: subTitleFont, fontSize: 'clamp(20px, 5vw, 36px)', paddingTop: 'clamp(5px, 1vh, 10px)', color: textColorLight, fontWeight: 'bold', textShadow: `-1.5px -1.5px 0 ${outlineColor}, 1.5px -1.5px 0 ${outlineColor}, -1.5px 1.5px 0 ${outlineColor}, 1.5px 1.5px 0 ${outlineColor}, 2px 2px 3px rgba(0,0,0,0.3)`, lineHeight: 1, whiteSpace: 'pre-line', zIndex: 0},
    questionBox: { width: '85%', maxWidth: '480px', backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`, boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`, padding: 'clamp(10px, 2vw, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 1.5vh, 12px)', minHeight: 'clamp(100px, 20vh, 180px)'},
    questionImageContainer: { width: '100%', aspectRatio: '16/10', maxHeight: 'clamp(150px, 30vh, 250px)', borderRadius: 'clamp(10px, 1.5vw, 15px)', border: `max(2px, 0.4vw) solid ${outlineColor}`, overflow: 'hidden'},
    questionImage: { width: '100%', height: '100%', objectFit: 'cover' },
    questionTextBelowImage: { fontFamily: questionFont, fontSize: 'clamp(14px, 3vw, 26px)', fontWeight: '600', color: textColorDark, textAlign: 'center', width: '95%', whiteSpace: 'pre-line', lineHeight: 1.2},
    progressBarContainer: { width: '70%', maxWidth: '350px', margin: '0 auto' },
    optionsBox: { width: '90%', maxWidth: '500px', backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 'clamp(20px, 3vw, 30px)', border: `max(3px, 0.6vw) solid ${outlineColor}`, boxShadow: `max(5px, 0.8vw) max(5px, 0.8vw) 0px rgba(0,0,0,0.2)`, padding: 'clamp(15px, 2.5vw, 25px)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(10px, 2vw, 15px)'},
    optionButton: { backgroundColor: themeYellow, borderRadius: 'clamp(12px, 2vw, 20px)', border: `max(2.5px, 0.5vw) solid ${outlineColor}`, boxShadow: `max(3px, 0.6vw) max(3px, 0.6vw) 0px ${outlineColor}`, padding: 'clamp(8px, 1.5vh, 15px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: 'clamp(45px, 8vh, 70px)', transition: 'transform 0.1s ease-out, background-color 0.2s, opacity 0.2s', cursor: 'pointer'},
    optionLabel: { fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: '900', color: textColorDark, minWidth: 'clamp(25px, 5vw, 40px)', textAlign: 'center', marginRight: 'clamp(5px, 1vw, 10px)', textShadow: '1px 1px 0px rgba(255,255,255,0.5)'},
    optionText: { fontFamily: optionFont, fontSize: 'clamp(18px, 3.5vw, 30px)', fontWeight: 'bold', color: textColorDark, flexGrow: 1, textAlign: 'left', textShadow: '1px 1px 0px rgba(255,255,255,0.5)', whiteSpace: 'pre-line', lineHeight: 1.1},
    correctOptionStyle: { backgroundColor: correctBgColor },
    correctOptionTextStyle: { color: textColorLight, textShadow: `1px 1px 0px rgba(0,0,0,0.3)` },
    incorrectOptionStyle: { opacity: 0.6, transform: 'scale(0.97)', filter: 'grayscale(30%)' },
    crewImageContainer: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: `clamp(120px, 22vh, 200px)`, zIndex: 4, overflow: 'hidden', maskImage: 'linear-gradient(to top, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)', pointerEvents: 'none'},
    crewImage: { display: 'block', position: 'absolute', bottom: '-10%', height: '100%', width: '100%', left: '0%', objectFit: 'contain', objectPosition: 'center bottom'},
};

const childVariant = (delayIndex: number = 0, yStart = 15, scaleStart = 0.9) => ({
  hidden: { opacity: 0, y: yStart, scale: scaleStart },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 130, delay: 0.1 + delayIndex * 0.1 }}
});
const contentAreaVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 }}
};
// Removed decorAssetVariant as AnimatedAsset defines its own variants internally based on props.

interface SceneProps extends PinkGridQuizV2Props {
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
    // sceneSpecificBackgroundImageUrl is now just backgroundImageUrl from props
    backgroundImageUrl?: string | null;
    // sceneSpecificBackgroundVideoUrl is now just backgroundVideoUrl from props
    backgroundVideoUrl?: string | null;
    hasInteracted: boolean;
}

export const PinkGridQuizV2Scene: React.FC<SceneProps> = ({
    sceneId, titleText = "GUESS THE CHARACTER\nDIFFICULTY: EASY",
    questionText, options, referenceImageUrl, correctAnswerId, timerDuration,
    durationInSeconds, onSceneEnd,
    backgroundImageUrl: sceneSpecificBackgroundImageUrl, // Prop from App
    backgroundVideoUrl: sceneSpecificBackgroundVideoUrl, // Prop from App
    enableOverlay, overlayColor,
    crewImageUrl, logoUrl = "/images/anime-logo-placeholder.png",
    hasInteracted,
}) => {
    const instanceId = useRef(`pgq2-${sceneId}-${Math.random().toString(36).substring(7)}`).current;
    const effectiveTimerDuration = useMemo(() => timerDuration ?? 5, [timerDuration]);

    const [timeLeft, setTimeLeft] = useState(effectiveTimerDuration);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    const tickAudioRef = useRef<HTMLAudioElement>(null);
    const revealAudioRef = useRef<HTMLAudioElement>(null);
    const hasPlayedRevealAudioRef = useRef(false);

    const sceneBgVideoRef = useRef<HTMLVideoElement>(null); // Ref for scene video
    const lastSetSceneVideoSrcRef = useRef<string | null | undefined>(null); // Ref to track last set scene video src

    // Effect to manage scene-specific background video
    useEffect(() => {
        const videoEl = sceneBgVideoRef.current;
        const videoSrc = sceneSpecificBackgroundVideoUrl; // This is the prop from App

        // console.log(`SCENE (${instanceId}) VIDEO effect: Fired. Src: ${videoSrc}, LastSet: ${lastSetSceneVideoSrcRef.current}`);

        if (videoEl) {
            if (videoSrc) {
                videoEl.style.display = 'block'; // Make visible
                if (lastSetSceneVideoSrcRef.current !== videoSrc) {
                    // console.log(`SCENE (${instanceId}) VIDEO: Setting new SRC: ${videoSrc}`);
                    videoEl.src = videoSrc;
                    videoEl.load();
                    lastSetSceneVideoSrcRef.current = videoSrc;
                }
                if (videoEl.paused) {
                    videoEl.play().catch(e => console.warn(`Scene (${instanceId}) BG video play failed: ${e.message}`));
                }
            } else {
                // No video src for this scene
                if (lastSetSceneVideoSrcRef.current) {
                    // console.log(`SCENE (${instanceId}) VIDEO: Clearing SRC.`);
                    videoEl.pause();
                    videoEl.removeAttribute('src');
                    videoEl.load();
                    lastSetSceneVideoSrcRef.current = null;
                }
                videoEl.style.display = 'none'; // Hide the video element
            }
        }
    }, [sceneSpecificBackgroundVideoUrl, instanceId]); // Depends on the video URL prop and stable instanceId

    // Effect for Scene End
    useEffect(() => {
        let sceneEndTimeoutId: number | undefined;
        if (isRevealing && answered) {
            const revealAudio = revealAudioRef.current;
            if (hasInteracted && !hasPlayedRevealAudioRef.current && revealAudio?.paused) {
                revealAudio.play().catch(e => console.warn(`Reveal audio play failed for ${instanceId}:`, e.message));
                hasPlayedRevealAudioRef.current = true;
            }
            sceneEndTimeoutId = setTimeout(() => {
                onSceneEnd({ sceneId, isCorrect: selectedId === correctAnswerId });
            }, 3000);
        }
        return () => clearTimeout(sceneEndTimeoutId);
    }, [isRevealing, answered, selectedId, correctAnswerId, sceneId, onSceneEnd, instanceId, hasInteracted]);

    // Effect for Scene Duration Timeout
    useEffect(() => {
        if (answered) return;
        const sceneTimeoutId = setTimeout(() => {
            if (!answered) {
                setAnswered(true); setIsRevealing(true); setSelectedId(null);
            }
        }, durationInSeconds * 1000);
        return () => clearTimeout(sceneTimeoutId);
    }, [answered, durationInSeconds, instanceId]);

    // Effect for Countdown Timer interval
    useEffect(() => {
        if (answered || timeLeft <= 0) {
            if (timeLeft <= 0 && !answered) {
                setAnswered(true); setIsRevealing(true); setSelectedId(null);
            }
            return;
        }
        const intervalId = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, answered, instanceId]);

    // Effect for playing Tick Sound
    useEffect(() => {
        const tickAudio = tickAudioRef.current;
        if (!tickAudio) return;
        if (hasInteracted && !answered && timeLeft > 0 && timeLeft < effectiveTimerDuration) {
            // console.log(`SCENE (${instanceId}): Playing tick sound (timeLeft: ${timeLeft})`);
            tickAudio.currentTime = 0;
            tickAudio.play().catch(e => console.warn(`Tick audio play failed for ${instanceId} at ${timeLeft}s:`, e.message));
        }
        if ((answered || timeLeft <= 0) && !tickAudio.paused) {
            // console.log(`SCENE (${instanceId}): Pausing tick sound (answered: ${answered}, timeLeft: ${timeLeft})`);
            tickAudio.pause(); tickAudio.currentTime = 0;
        }
    }, [timeLeft, hasInteracted, answered, effectiveTimerDuration, instanceId]);

    const handleSelect = (id: string) => {
        if (answered) return;
        setSelectedId(id); setAnswered(true); setIsRevealing(true);
        const tickAudio = tickAudioRef.current;
        if (tickAudio && !tickAudio.paused) {
            tickAudio.pause(); tickAudio.currentTime = 0;
        }
    };

    const [mainTitle, difficulty] = titleText.split('\n');
    const timerProg = effectiveTimerDuration > 0 ? Math.max(0, Math.min(1, timeLeft / effectiveTimerDuration)) : 0;
    // currentBgVideoUrlForScene is now sceneSpecificBackgroundVideoUrl (prop)
    // currentBgImageUrlForScene is now sceneSpecificBackgroundImageUrl (prop)
    const decorBaseDelayS = 0.2; const decorStaggerS = 0.07;

    // Stagger children for decor layer using a stable variants object
    const decorLayerParentVariants = useMemo(() => ({
        visible: { transition: { staggerChildren: decorStaggerS } }
    }), [decorStaggerS]);


    return (
        <motion.div
            style={{
                ...styles.sceneRoot,
                backgroundColor: (!sceneSpecificBackgroundVideoUrl && !sceneSpecificBackgroundImageUrl) ? defaultSceneBgColor : 'transparent',
            }}
        >
            {/* Scene Background Video - Managed by useEffect */}
            <video
                ref={sceneBgVideoRef}
                key={`scene-bgvid-managed-${instanceId}`} // Stable key for the video element itself
                autoPlay muted loop playsInline
                style={{ ...styles.backgroundMedia, display: 'none' }} // Initially hidden
                onError={(e) => console.error(`Scene (${instanceId}) BG video element error:`, (e.target as HTMLVideoElement).currentSrc, e)}
            />
            {/* Scene Background Image - Fallback if no video for this scene */}
            {!sceneSpecificBackgroundVideoUrl && sceneSpecificBackgroundImageUrl && (
                 <motion.img
                    key={`scene-bgimg-${instanceId}-${sceneSpecificBackgroundImageUrl}`}
                    src={sceneSpecificBackgroundImageUrl} alt="" style={styles.backgroundMedia} loading="lazy"
                    onError={(e) => console.error(`SCENE (${instanceId}) BG image error:`, sceneSpecificBackgroundImageUrl, e)}
                 />
            )}
            {enableOverlay && overlayColor && <div style={{...styles.overlay, backgroundColor: overlayColor}} />}

            <div style={styles.effectsLayer}>
                 <ParticleSystem count={100} systemSeed={`pinkquiz-particles-${sceneId}`} particleBaseColor="hsl(20, 100%, 70%)" glowOpacity={0.3} />
            </div>

            {/* Corrected AnimatedAsset usage */}
            <motion.div style={styles.decorLayer} initial="hidden" animate="visible" variants={decorLayerParentVariants}>
                <AnimatedAsset src="/images/decor-squiggle-pink.png" top="0%" right="0%" width="clamp(100px, 25vw, 180px)" style={{transform: 'translateX(-50%)'}}
                    delaySeconds={decorBaseDelayS} initialX="-50%" initialRotation={-5} />
                <AnimatedAsset src="/images/decor-arrow-black.png" top="28%" right="0%" width="clamp(40px, 10vw, 80px)"
                    delaySeconds={decorBaseDelayS + decorStaggerS * 1} initialY={-20} initialRotation={-120} />
                <AnimatedAsset src="/images/decor-star-yellow.png" top="60%" right="-5%" width="clamp(80px, 20vw, 150px)"
                    delaySeconds={decorBaseDelayS + decorStaggerS * 2} initialX={30} initialRotation={20} />
                <AnimatedAsset src="/images/decor-lightning-yellow.png" bottom="clamp(30px, 20vh, 300px)" left="-10%" width="clamp(100px, 22vw, 180px)"
                    delaySeconds={decorBaseDelayS + decorStaggerS * 3} initialX={40} initialY={20} initialRotation={15}/>
            </motion.div>

            <motion.div style={styles.topBar} variants={childVariant(-0.5, -20)} initial="hidden" animate="visible">
                {logoUrl && <img src={logoUrl} style={styles.logoImage} alt="Logo" />}
                <div style={styles.timerContainer}>
                    {effectiveTimerDuration > 0 && <CircularTimer remainingSeconds={timeLeft} totalDurationSeconds={effectiveTimerDuration} size={Math.min(window.innerWidth*0.12, 60)} strokeWidth={Math.min(window.innerWidth*0.012, 6)} progressColor={themeYellow} />}
                </div>
            </motion.div>

            <motion.div style={styles.contentArea} variants={contentAreaVariant} initial="hidden" animate="visible">
                 <motion.div style={styles.titleBlock} variants={childVariant(0)}>
                    {mainTitle && <div style={styles.mainTitleText}>{mainTitle}</div>}
                    {difficulty && <div style={styles.difficultyText}>{difficulty}</div>}
                </motion.div>

                <motion.div style={styles.questionBox} variants={childVariant(1)}>
                    {referenceImageUrl && (
                        <motion.div style={styles.questionImageContainer} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1, transition:{delay:0.1}}} >
                            <img src={referenceImageUrl} style={styles.questionImage} alt="Question context"/>
                        </motion.div>
                    )}
                    {questionText && (
                        <motion.div style={styles.questionTextBelowImage} initial={{opacity:0, y:10}} animate={{opacity:1, y:0, transition:{delay:0.15}}}>
                            {questionText}
                        </motion.div>
                    )}
                </motion.div>

                {effectiveTimerDuration > 0 &&
                    <motion.div style={styles.progressBarContainer} variants={childVariant(2)}>
                        <ProgressBar progress={timerProg} fillColor={progressBarFill} backgroundColor={progressBarBg} height={Math.min(window.innerWidth * 0.025, 15)} />
                    </motion.div>
                }
                <motion.div style={styles.optionsBox} variants={childVariant(3)}>
                     {options.map((opt) => {
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
                                key={opt.id}
                                style={{ ...styles.optionButton, ...dynamicButtonStyle }}
                                onClick={() => handleSelect(opt.id)}
                                disabled={answered}
                                whileHover={!answered ? { scale: 1.03, filter:'brightness(1.1)' } : {}}
                                whileTap={!answered ? { scale: 0.97 } : {}}>
                                <span style={{...styles.optionLabel, ...dynamicTextStyle}}>{opt.id}.</span>
                                <span style={{...styles.optionText, ...dynamicTextStyle}}>{opt.text}</span>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </motion.div>

            {crewImageUrl &&
                <motion.div style={styles.crewImageContainer} variants={childVariant(4, 50, 0.9)} initial="hidden" animate="visible">
                    <img src={crewImageUrl} style={styles.crewImage} alt="Decorative crew"/>
                </motion.div>
            }

            <audio ref={tickAudioRef} src="/audio/ticking.mp3" preload="auto" loop={false} /> {/* Ensure loop is false for tick */}
            <audio ref={revealAudioRef} src="/audio/reveal.mp3" preload="auto" />
        </motion.div>
    );
};