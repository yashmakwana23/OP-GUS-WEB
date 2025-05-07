// src/scenes/PinkGridImageQuizScene.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PinkGridImageQuizProps } from '../types/quizDataSchema';
import { CircularTimer } from '../components/CircularTimer';
import { ProgressBar } from '../components/ProgressBar';
import { AnimatedAsset } from '../components/AnimatedAsset'; // Use migrated version

// --- Fonts & Colors ---
const titleFont = '"Bangers", Impact, fantasy, sans-serif';
const questionFont = '"Poppins", sans-serif';
const optionFont = '"Poppins", sans-serif';
const optionLabelFont = '"Bangers", Impact, fantasy, sans-serif';
const pinkColor = '#ffd700'; const pinkGradientEnd = '#ffeb7e';
const yellowColor = '#ffd700'; const textColorLight = 'white';
const textColorDark = '#333'; const outlineColor = 'black';
const correctBgColor = '#87CEEB'; // Sky Blue
const progressBarFill = `linear-gradient(90deg, ${pinkColor} 0%, ${pinkGradientEnd} 100%)`;
const progressBarBg = 'rgba(0, 0, 0, 0.1)';

// --- Styles (Adapted & Responsive) ---
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#a7c7e7' },
    backgroundMedia: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
    overlay: { position: 'absolute', inset: 0, zIndex: 1 },
    decorLayer: { position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none'},

    topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: 'clamp(10px, 2vh, 20px) clamp(10px, 2vw, 20px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 'clamp(60px, 12vh, 100px)'},
    logoImage: { width: 'clamp(70px, 18vw, 130px)', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))' },

    contentScrollArea: { flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 'clamp(70px, 14vh, 120px)', paddingBottom: 'clamp(80px, 20vh, 250px)', gap: 'clamp(15px, 2.5vh, 25px)', paddingLeft: 'clamp(15px, 3vw, 25px)', paddingRight: 'clamp(15px, 3vw, 25px)' },

    titleContainer: { textAlign: 'center', width: '100%', maxWidth: '90%', marginBottom: 'clamp(5px, 1vh, 10px)' },
    titleIts: { display: 'inline-block', fontFamily: titleFont, fontSize: 'clamp(28px, 5.5vw, 55px)', fontWeight: 700, backgroundColor: yellowColor, color: textColorDark, padding: 'clamp(3px,0.8vh,6px) clamp(10px,2.5vw,20px)', borderRadius: '8px', textShadow: `1px 1px 0 ${outlineColor}`, border: `max(1.5px, 0.25vw) solid ${outlineColor}`, marginBottom: '-0.8vh', position: 'relative', zIndex: 2 },
    titleQuizTime: { fontFamily: titleFont, fontSize: 'clamp(36px, 7vw, 70px)', fontWeight: 900, color: textColorLight, lineHeight: 1, textShadow: `-1px -1px 0 ${outlineColor}, 1px -1px 0 ${outlineColor}, -1px 1px 0 ${outlineColor}, 1px 1px 0 ${outlineColor}, 1.5px 1.5px 0px rgba(0,0,0,0.2)`, position: 'relative', zIndex: 1, whiteSpace: 'pre-line' },

    questionBox: { width: '100%', maxWidth: 'clamp(280px, 90vw, 500px)', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 'clamp(20px, 4vw, 35px)', border: `max(3px, 0.5vw) solid ${outlineColor}`, boxShadow: `0.5vw 0.5vw 0px rgba(0,0,0,0.1)`, padding: 'clamp(15px, 3vw, 25px)', display: 'flex', alignItems: 'stretch', minHeight: 'clamp(80px, 15vh, 160px)', position: 'relative', overflow: 'hidden' },
    questionImageContainer: { display: 'flex', alignItems: 'center', paddingRight: 'clamp(10px, 2vw, 15px)', marginRight: 'clamp(10px, 2vw, 15px)', borderRight: `max(2px, 0.3vw) solid #e0e0e0`, flexShrink: 0 },
    questionImageThumb: { width: 'clamp(70px, 18vw, 120px)', height: 'clamp(70px, 18vh, 120px)', borderRadius: '15px', border: `max(2px, 0.4vw) solid ${outlineColor}`, objectFit: 'cover', boxShadow: '0.3vw 0.3vw 0px rgba(0,0,0,0.1)' },
    questionText: { fontFamily: questionFont, fontSize: 'clamp(15px, 3.5vw, 28px)', fontWeight: 700, color: textColorDark, whiteSpace: 'pre-line', lineHeight: 1.35, textAlign: 'left', width: '100%', alignSelf: 'center' },

    progressBarContainer: { width: 'clamp(200px, 70vw, 350px)', margin: 'clamp(10px, 2vh, 20px) auto' },

    optionsBox: { width: '100%', maxWidth: 'clamp(280px, 90vw, 500px)', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 'clamp(20px, 4vw, 35px)', border: `max(3px, 0.5vw) solid ${outlineColor}`, boxShadow: `0.5vw 0.5vw 0px rgba(0,0,0,0.1)`, padding: 'clamp(15px, 3vw, 25px)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(15px, 3vw, 25px)', position: 'relative' }, // Grid layout
    optionButtonImage: { backgroundColor: 'white', borderRadius: 'clamp(15px, 3vw, 25px)', border: `max(2.5px, 0.4vw) solid ${outlineColor}`, padding: 'clamp(8px, 1.5vw, 15px)', paddingTop: 'clamp(25px, 6vw, 40px)', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: `0.3vw 0.3vw 0px rgba(0,0,0,0.1)`, transition: 'transform 0.1s, border-color 0.2s, opacity 0.2s, filter 0.2s, background-color 0.2s', position: 'relative', gap: 'clamp(5px, 1vw, 10px)', cursor: 'pointer' },
    optionLabelImage: { position: 'absolute', top: 'calc(clamp(25px, 6vw, 40px) * -0.5)', left: '50%', transform: 'translateX(-50%)', backgroundColor: pinkColor, color: textColorLight, borderRadius: '50%', width: 'clamp(35px, 8vw, 50px)', height: 'clamp(35px, 8vw, 50px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: optionLabelFont, fontSize: 'clamp(18px, 4vw, 30px)', fontWeight: 'bold', border: `max(1.5px, 0.3vw) solid ${outlineColor}`, zIndex: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    optionImageWrapper: { width: '80%', aspectRatio: '1 / 1', borderRadius: 'clamp(10px, 2vw, 15px)', border: `max(1.5px, 0.3vw) solid ${outlineColor}`, overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0 },
    optionImage: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
    optionTextImage: { fontFamily: optionFont, fontSize: 'clamp(13px, 2.8vw, 22px)', fontWeight: 900, color: textColorDark, textAlign: 'center', width: '100%', whiteSpace: 'pre-line', lineHeight: 1.1, marginTop: 'auto', padding: '3px 0' },
    // Reveal styles
    correctOptionStyleImage: { borderColor: correctBgColor, borderWidth: `max(3.5px, 0.6vw)`, transform: 'scale(1.03)', backgroundColor: '#e0f7fa' },
    incorrectOptionStyleImage: { opacity: 0.5, transform: 'scale(0.97)', filter: 'grayscale(70%)' },

    crewImageContainer: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: `clamp(100px, 25vh, 280px)`, zIndex: 5, overflow: 'hidden', maskImage: 'linear-gradient(to top, black 0%, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, black 60%, transparent 100%)', pointerEvents: 'none' },
    crewImage: { display: 'block', position: 'absolute', bottom: '-5%', height: '100%', width: '120%', left: '-10%', objectFit: 'contain', objectPosition: 'center bottom' },
};

// --- Framer Motion Variants ---
const UIVariant = (delay = 0, yStart = 15, scaleStart = 0.9) => ({ /* ... same as PinkGridQuizScene ... */
    initial: { opacity: 0, y: yStart, scale: scaleStart },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 150, delay } },
    exit: { opacity: 0, y: yStart, scale: scaleStart, transition: { duration: 0.2 } }
});

interface SceneProps extends PinkGridImageQuizProps { // From quizDataSchema
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
    globalBackgroundImageUrl?: string | null; globalBackgroundVideoUrl?: string | null;
}

export const PinkGridImageQuizScene: React.FC<SceneProps> = ({
    sceneId, titleText = "IT'S QUIZ TIME", questionText, options, referenceImageUrl, correctAnswerId, timerDuration,
    durationInSeconds, onSceneEnd, backgroundUrl, backgroundVideoUrl, enableOverlay, overlayColor,
    crewImageUrl, logoUrl = "/images/anime-logo-placeholder.png",
}) => {
    const effectiveTimer = timerDuration ?? 5;
    const [timeLeft, setTimeLeft] = useState(effectiveTimer);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    // Timers logic (identical to PinkGridQuizScene)
    useEffect(() => { if (answered || timeLeft <= 0) { if (timeLeft <=0 && !answered) { setAnswered(true); setIsRevealing(true); } return; } const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000); return () => clearInterval(interval); }, [timeLeft, answered]);
    useEffect(() => { let sceneEndTimeout: NodeJS.Timeout; if (isRevealing) { sceneEndTimeout = setTimeout(() => { onSceneEnd({ sceneId, isCorrect: answered ? (selectedId === correctAnswerId) : null }); }, 3000); } else { sceneEndTimeout = setTimeout(() => { if (!answered) { setAnswered(true); setIsRevealing(true); } else { onSceneEnd({ sceneId, isCorrect: selectedId === correctAnswerId }); } }, durationInSeconds * 1000); } return () => clearTimeout(sceneEndTimeout); }, [isRevealing, answered, durationInSeconds, onSceneEnd, sceneId, correctAnswerId, selectedId]);

    const handleSelect = (id: string) => { if (answered) return; setSelectedId(id); setAnswered(true); setIsRevealing(true); };
    const [titleL1, titleL2] = titleText.split('\n');
    const timerProg = Math.max(0, Math.min(1, timeLeft / effectiveTimer));

    // --- Decor Asset Delays ---
    const decorBaseDelayS = 6 / 30; const decorStaggerS = 2 / 30;

    return (
        <motion.div style={styles.sceneRoot} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            {backgroundVideoUrl && <video src={backgroundVideoUrl} autoPlay muted loop style={styles.backgroundMedia} />}
            {!backgroundVideoUrl && backgroundUrl && <img src={backgroundUrl} alt="" style={styles.backgroundMedia} />}
            {enableOverlay && overlayColor && <div style={{...styles.overlay, backgroundColor: overlayColor}} />}

            {/* --- Decorative Elements --- */}
             <div style={styles.decorLayer}>
                <AnimatedAsset src="/images/decor-squiggle-pink.png" delaySeconds={decorBaseDelayS + decorStaggerS * 0} top="3%" left="50%" width="clamp(80px, 15vw, 150px)" initialRotation={-15} initialX={-100} />
                <AnimatedAsset src="/images/decor-arrow-black.png" delaySeconds={decorBaseDelayS + decorStaggerS * 1} top="22%" left="3%" width="clamp(50px, 10vw, 100px)" initialRotation={-100} initialX={-100} />
                <AnimatedAsset src="/images/decor-star-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 2} top="40%" right="1%" width="clamp(100px, 20vw, 190px)" initialRotation={15} initialX={100} />
                <AnimatedAsset src="/images/decor-lightning-yellow.png" delaySeconds={decorBaseDelayS + decorStaggerS * 3} bottom="clamp(120px, 28vh, 300px)" right="1%" width="clamp(150px, 30vw, 310px)" initialRotation={10} initialX={100} initialY={50} />
                <AnimatedAsset src="/images/decor-circle-text.png" delaySeconds={decorBaseDelayS + decorStaggerS * 4} bottom="clamp(130px, 30vh, 310px)" left="1%" width="clamp(100px, 20vw, 200px)" initialRotation={-5} initialX={-100} initialY={50} />
            </div>

             {/* --- Top Bar Elements --- */}
             <div style={styles.topBar}>
                <motion.div variants={UIVariant(0.1)} initial="initial" animate="animate">
                    {logoUrl && <img src={logoUrl} style={styles.logoImage} alt="Logo" />}
                </motion.div>
                <motion.div variants={UIVariant(0.3)} initial="initial" animate="animate">
                    {effectiveTimer > 0 && <CircularTimer remainingSeconds={timeLeft} totalDurationSeconds={effectiveTimer} />}
                </motion.div>
            </div>

            {/* --- Scrollable Content --- */}
            <div style={styles.contentScrollArea}>
                <motion.div style={styles.titleContainer} variants={UIVariant(0.2)} initial="initial" animate="animate">
                    {titleL1 && titleL2 && (<><div style={styles.titleIts}>{titleL1}</div><div style={styles.titleQuizTime}>{titleL2}</div></>)}
                    {titleL1 && !titleL2 && <div style={styles.titleQuizTime}>{titleL1}</div>}
                </motion.div>

                <motion.div style={styles.questionBox} variants={UIVariant(0.35)} initial="initial" animate="animate">
                    {referenceImageUrl && <div style={styles.questionImageContainer}><img src={referenceImageUrl} style={styles.questionImageThumb} alt="Ref"/></div>}
                    <div style={{...styles.questionText, paddingLeft: referenceImageUrl ? 0 : 'clamp(5px, 1vw, 10px)'}}>{questionText}</div>
                </motion.div>

                {effectiveTimer > 0 &&
                    <motion.div style={styles.progressBarContainer} variants={UIVariant(0.4)} initial="initial" animate="animate">
                        <ProgressBar progress={timerProg} fillColor={progressBarFill} backgroundColor={progressBarBg} />
                    </motion.div>
                }

                <motion.div style={styles.optionsBox} variants={UIVariant(0.5)} initial="initial" animate="animate">
                     {options.map((opt, i) => {
                        const isCorrect = opt.id === correctAnswerId;
                        const isSelected = opt.id === selectedId;
                        let dynamicStyle = {};
                        if (isRevealing && answered) {
                            if (isCorrect) dynamicStyle = styles.correctOptionStyleImage;
                            else if (isSelected) dynamicStyle = { ...styles.incorrectOptionStyleImage, outline: 'max(2px,0.4vw) solid red' };
                            else dynamicStyle = styles.incorrectOptionStyleImage;
                        }
                        return (
                             <motion.button
                                key={opt.id}
                                style={{ ...styles.optionButtonImage, ...dynamicStyle }}
                                onClick={() => handleSelect(opt.id)}
                                disabled={answered}
                                variants={UIVariant(0.1 * i, 10, 0.95)} // Stagger option entry
                                whileHover={!answered ? { scale: 1.04 } : {}}
                                whileTap={!answered ? { scale: 0.96 } : {}}
                            >
                                <div style={{...styles.optionLabelImage, backgroundColor: (isRevealing && answered && isCorrect) ? correctBgColor : pinkColor}}>{opt.id}</div>
                                <div style={styles.optionImageWrapper}>
									<img src={opt.imageUrl} style={styles.optionImage} alt={`Option ${opt.text || opt.id}`} onError={(e) => console.error(`Failed to load image: ${opt.imageUrl}`)}/>
								</div>
								{opt.text && <div style={styles.optionTextImage}>{opt.text}</div>}
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {/* --- Crew Image --- */}
            {crewImageUrl &&
                <motion.div style={styles.crewImageContainer} variants={UIVariant(0.6, 30, 1)} initial="initial" animate="animate">
                    <img src={crewImageUrl} style={styles.crewImage} alt="Crew"/>
                </motion.div>
            }
        </motion.div>
    );
};