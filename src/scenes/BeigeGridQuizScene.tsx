// src/scenes/BeigeGridQuizScene.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { BeigeGridQuizProps } from '../types/quizDataSchema';
import { GridBackground } from '../components/GridBackground'; // Use migrated GridBackground
import { AnimatedAsset } from '../components/AnimatedAsset'; // Use migrated AnimatedAsset

// --- Fonts & Colors ---
const titleFont = '"Bangers", Impact, sans-serif';
const questionFont = "'Arial', sans-serif";
const optionFont = '"Bangers", Impact, sans-serif';
const beigeColor = '#f5f1e8';
const blueColor = '#4a90e2';
const pinkColor = '#ff8fab';
const textColorDark = '#555';
const correctBgColor = '#90ee90'; // Light Green
const correctBorderColor = '#4CAF50'; // Darker Green Border
const correctTextColor = '#2e7d32'; // Dark Green text

// --- Styles (Adapted & Responsive) ---
const styles: Record<string, React.CSSProperties> = {
    sceneRoot: { position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: beigeColor },
    decorLayer: { position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none'},

    contentScrollArea: { flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', gap: 'clamp(10px, 2vh, 20px)', padding: 'clamp(15px, 3vw, 30px)', zIndex: 2 },

    titleContainer: { textAlign: 'center', marginTop: 'clamp(5px, 1vh, 10px)' },
    titleIts: { display: 'inline-block', fontFamily: titleFont, fontSize: 'clamp(25px, 5vw, 50px)', backgroundColor: blueColor, color: 'white', padding: '0.5vh clamp(15px, 4vw, 30px)', borderRadius: '50px', marginBottom: '-1vh', position: 'relative', zIndex: 2, boxShadow: '3px 3px 0px rgba(0,0,0,0.1)' },
    titleQuizTime: { fontFamily: titleFont, fontSize: 'clamp(70px, 18vw, 150px)', color: pinkColor, lineHeight: 1, position: 'relative', zIndex: 1, textShadow: `-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 4px 4px 0px rgba(0,0,0,0.15)` },

    questionText: { fontFamily: questionFont, fontSize: 'clamp(16px, 3.5vw, 28px)', fontWeight: 'bold', color: textColorDark, textAlign: 'center', marginTop: '-1.5vh', textShadow: '1px 1px 0px rgba(255,255,255,0.7)', whiteSpace: 'pre-line', maxWidth: '90%' },

    centralImageContainer: { width: 'clamp(180px, 60vw, 350px)', aspectRatio: '1.2 / 1', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0.5vh 0' },
    centralImage: { display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.25))' },

    optionsContainer: { width: '100%', maxWidth: 'clamp(280px, 85vw, 500px)', display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vh, 18px)', marginBottom: 'clamp(10px, 2vh, 20px)' },
    optionButton: { backgroundColor: blueColor, borderRadius: 'clamp(10px, 2vw, 15px)', padding: 'clamp(10px, 2vh, 18px) clamp(12px, 2.5vw, 25px)', display: 'flex', alignItems: 'center', border: 'max(2px, 0.3vw) solid black', borderBottomWidth: `max(4px, 0.7vw)`, borderRightWidth: `max(4px, 0.7vw)`, transition: 'transform 0.1s, background-color 0.2s, border-color 0.2s, color 0.2s', cursor: 'pointer' },
    optionLabel: { fontFamily: optionFont, fontSize: 'clamp(18px, 4vw, 32px)', fontWeight: 'bold', color: 'white', marginRight: 'clamp(8px, 1.5vw, 15px)', minWidth: 'clamp(25px, 5vw, 40px)', textAlign: 'center', textShadow: '1.5px 1.5px 0 rgba(0,0,0,0.25)' },
    optionTextValue: { fontFamily: optionFont, fontSize: 'clamp(18px, 4vw, 32px)', fontWeight: 'bold', color: 'white', flexGrow: 1, textAlign: 'left', textShadow: '1.5px 1.5px 0 rgba(0,0,0,0.25)', whiteSpace: 'pre-line' },
    // Reveal styles
    correctOptionStyle: { backgroundColor: correctBgColor, borderColor: correctBorderColor, transform: 'scale(1.03) translateY(-1px)' },
    correctOptionTextStyle: { color: correctTextColor, textShadow: '1px 1px 0 rgba(255,255,255,0.6)' },
    incorrectOptionStyle: { opacity: 0.6, filter: 'grayscale(40%)', transform: 'scale(0.98)' },
};

// --- Framer Motion Variants ---
const UIVariant = (delay = 0, yStart = 15, scaleStart = 0.95) => ({ /* ... same as previous ... */
    initial: { opacity: 0, y: yStart, scale: scaleStart },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 150, delay } },
});

interface SceneProps extends BeigeGridQuizProps { // From quizDataSchema
    sceneId: string; durationInSeconds: number;
    onSceneEnd: (result: { sceneId: string, isCorrect: boolean | null }) => void;
}

export const BeigeGridQuizScene: React.FC<SceneProps> = ({
    sceneId, titleText = "It's QUIZ TIME", questionText, options, referenceImageUrl, correctAnswerId, timerDuration, // timerDuration not used in this style, but kept for prop consistency
    durationInSeconds, onSceneEnd,
}) => {
    // Simplified state for this style - no timer shown, reveal happens on click
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    // Scene End Logic
    useEffect(() => { let t: NodeJS.Timeout; if (isRevealing) { t = setTimeout(() => { onSceneEnd({ sceneId, isCorrect: answered ? (selectedId === correctAnswerId) : null }); }, 3000); } else { t = setTimeout(() => { if (!answered) { setAnswered(true); setIsRevealing(true); } else { onSceneEnd({ sceneId, isCorrect: selectedId === correctAnswerId }); } }, durationInSeconds * 1000); } return () => clearTimeout(t); }, [isRevealing, answered, durationInSeconds, onSceneEnd, sceneId, correctAnswerId, selectedId]);

    const handleSelect = (id: string) => { if (answered) return; setSelectedId(id); setAnswered(true); setIsRevealing(true); };
    const [titleL1, titleL2] = titleText.split('\n');

    // --- Decor Delays ---
    const decorDelayStep = 0.06; // ~2 frames at 30fps

    return (
        <motion.div style={styles.sceneRoot} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <GridBackground color="rgba(0, 0, 0, 0.08)" lineThickness={1.8} spacing={60} />

            {/* --- Decorative Elements --- */}
            <div style={styles.decorLayer}>
                <AnimatedAsset src="/images/decor-heart-red.png" delaySeconds={decorDelayStep * 5} top="5%" right="8%" width="clamp(30px, 6vw, 60px)" initialRotation={-15}/>
                <AnimatedAsset src="/images/decor-star-yellow-outline.png" delaySeconds={decorDelayStep * 6} top="15%" left="10%" width="clamp(35px, 7vw, 70px)" initialRotation={20}/>
                <AnimatedAsset src="/images/decor-squiggle-pink-thin.png" delaySeconds={decorDelayStep * 7} bottom="10%" left="15%" width="clamp(40px, 8vw, 80px)" initialRotation={-10}/>
                <AnimatedAsset src="/images/decor-bean-yellow.png" delaySeconds={decorDelayStep * 8} bottom="18%" right="12%" width="clamp(30px, 6vw, 60px)" initialRotation={30}/>
                <AnimatedAsset src="/images/decor-arrow-red.png" delaySeconds={decorDelayStep * 9} top="35%" right="18%" width="clamp(35px, 7vw, 70px)" initialRotation={-25}/>
                <AnimatedAsset src="/images/decor-star-red-pop.png" delaySeconds={decorDelayStep * 10} bottom="35%" left="12%" width="clamp(40px, 8vw, 80px)" initialRotation={15}/>
            </div>

            <div style={styles.contentScrollArea}>
                <motion.div style={styles.titleContainer} variants={UIVariant(0.1)} initial="initial" animate="animate">
                    {titleL1 && titleL2 && (<><div style={styles.titleIts}>{titleL1}</div><div style={styles.titleQuizTime}>{titleL2}</div></>)}
                    {titleL1 && !titleL2 && <div style={styles.titleQuizTime}>{titleL1}</div>}
                </motion.div>

                <motion.div variants={UIVariant(0.2)} initial="initial" animate="animate">
                    <p style={styles.questionText}>{questionText}</p>
                </motion.div>

                {referenceImageUrl && (
                    <motion.div style={styles.centralImageContainer} variants={UIVariant(0.3)} initial="initial" animate="animate">
                         <img src={referenceImageUrl} style={styles.centralImage} alt="Question illustration"/>
                    </motion.div>
                )}

                <motion.div style={styles.optionsContainer} variants={UIVariant(0.4)} initial="initial" animate="animate">
					{options.map((opt, i) => {
						const isCorrect = opt.id === correctAnswerId;
                        const isSelected = opt.id === selectedId;
                        let dynamicStyle: React.CSSProperties = {};
                        let textDynamicStyle: React.CSSProperties = {};
                        if (isRevealing && answered) {
                            if (isCorrect) { dynamicStyle = styles.correctOptionStyle; textDynamicStyle = styles.correctOptionTextStyle; }
                             else if (isSelected) dynamicStyle = { ...styles.incorrectOptionStyle, outline: 'max(2px,0.4vw) solid red' };
                            else dynamicStyle = styles.incorrectOptionStyle;
                        }
						return (
							<motion.button
								key={opt.id}
								style={{ ...styles.optionButton, ...dynamicStyle }}
								onClick={() => handleSelect(opt.id)}
								disabled={answered}
                                variants={UIVariant(0.1 * i, 10, 0.95)} // Stagger option entry
                                whileHover={!answered ? { scale: 1.04, filter:'brightness(1.1)' } : {}}
                                whileTap={!answered ? { scale: 0.96 } : {}}
                            >
								<span style={{...styles.optionLabel, ...textDynamicStyle}}>{opt.id}.</span>
								<span style={{...styles.optionTextValue, ...textDynamicStyle}}>{opt.text}</span>
							</motion.button>
						);
					})}
				</motion.div>
            </div>
        </motion.div>
    );
};