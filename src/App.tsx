// src/App.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { parseQuizData, QuizData, SceneData } from './types/quizDataSchema';
import { AnimatePresence, motion } from 'framer-motion';

// --- Scene Component Imports ---
import { IntroSceneV1 } from './scenes/IntroSceneV1';
import { PinkGridQuizV2Scene } from './scenes/PinkGridQuizV2Scene';
import { PinkGridImageQuizScene } from './scenes/PinkGridImageQuizScene';
import { PinkGridQuizScene } from './scenes/PinkGridQuizScene';
import { BeigeGridQuizScene } from './scenes/BeigeGridQuizScene';
import { ImageQuizV1Scene } from './scenes/ImageQuizV1Scene';
import { OutroSceneV1 } from './scenes/OutroSceneV1';

// --- Scene Component Map ---
const sceneComponentMap: Record<string, React.FC<any>> = {
  "V1": IntroSceneV1,
  "PinkGridQuizV2": PinkGridQuizV2Scene,
  "PinkGridImageQuiz": PinkGridImageQuizScene,
  "PinkGridQuiz": PinkGridQuizScene,
  "BeigeGridQuiz": BeigeGridQuizScene,
  "ImageQuizV1": ImageQuizV1Scene,
  "OutroV1": OutroSceneV1,
};

// --- App Component ---
const App: React.FC = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userScores, setUserScores] = useState<Record<string, { isCorrect: boolean | null, sceneId: string }>>({});
  const [quizSessionId, setQuizSessionId] = useState(() => Date.now().toString());

  const globalBackgroundMusicRef = useRef<HTMLAudioElement>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/quiz_data.json?v=${Date.now()}`); // Cache bust
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
        const rawData = await response.json();
        const validatedData = parseQuizData(rawData);
        setQuizData(validatedData);
        setUserScores({});
        setCurrentSceneIndex(0);
        setQuizSessionId(Date.now().toString());
      } catch (e: any) {
        console.error("Data loading/parsing error:", e);
        setError(e.message || "Failed to load quiz data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizData();
  }, []);

  // --- Global Music Handling ---
  useEffect(() => {
    const audioEl = globalBackgroundMusicRef.current;
    if (quizData?.backgroundMusic && audioEl) {
      if (audioEl.src !== quizData.backgroundMusic) {
        audioEl.src = quizData.backgroundMusic;
      }
      audioEl.volume = 0.05; // Low volume for background
      audioEl.loop = true;
      // Autoplay can be tricky, attempt it
      audioEl.play().catch(e => console.warn("Global music autoplay blocked:", e));
    } else if (audioEl) {
      audioEl.pause();
      // Optional: Reset time if needed when music stops
      // audioEl.currentTime = 0;
    }
  }, [quizData?.backgroundMusic]); // Depend only on the music source

  // --- Current Scene Logic ---
  const currentSceneData = useMemo(() => {
    if (!quizData || currentSceneIndex >= quizData.scenes.length) return null;
    return quizData.scenes[currentSceneIndex];
  }, [quizData, currentSceneIndex]);

  const SceneComponent = useMemo(() => {
    if (!currentSceneData) return null;
    const Comp = sceneComponentMap[currentSceneData.variant];
    if (!Comp) {
      console.error(`Missing component map for variant: '${currentSceneData.variant}'`);
      setError(`Component not found for "${currentSceneData.variant}".`);
      return null;
    }
    return Comp;
  }, [currentSceneData]);

  // --- Scene Navigation ---
  const handleSceneEnd = (result?: { sceneId: string, isCorrect: boolean | null }) => {
    // console.log(`Scene ended: ${result?.sceneId}, Correct: ${result?.isCorrect}`);
    if (result && quizData) {
      const originalSceneId = quizData.scenes.find(s => s.sceneId === result.sceneId)?.sceneId || result.sceneId;
      setUserScores(prev => ({ ...prev, [originalSceneId]: { isCorrect: result.isCorrect, sceneId: originalSceneId } }));
    }
    if (quizData && currentSceneIndex < quizData.scenes.length - 1) {
      setCurrentSceneIndex(prevIndex => prevIndex + 1);
    } else {
      console.log("Quiz finished! Final Scores:", userScores);
      // Handle quiz completion (e.g., show summary, restart button)
      // Example restart:
      // setTimeout(() => {
      //   setCurrentSceneIndex(0);
      //   setUserScores({});
      //   setQuizSessionId(Date.now().toString());
      // }, 5000);
    }
  };

  // --- Render Logic ---
  if (isLoading) return <div className="quiz-viewport flex justify-center items-center bg-gray-800 text-white text-xl">Loading Quiz...</div>;
  if (error) return <div className="quiz-viewport flex flex-col justify-center items-center bg-red-800 text-white p-5 text-center"><h2 className="text-2xl font-bold mb-3">Error</h2><p>{error}</p><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">Reload Page</button></div>;
  if (!quizData || !currentSceneData || !SceneComponent) return <div className="quiz-viewport flex justify-center items-center bg-yellow-600 text-black p-4 text-center font-semibold">Error preparing scene. Please check configuration and console logs.</div>;

  // Determine Backgrounds for the current scene
  const sceneProps = currentSceneData.props || {};
  const sceneBgVideo = sceneProps.backgroundVideoUrl;
  const sceneBgImage = sceneProps.backgroundUrl || sceneProps.backgroundImageUrl;
  const globalBgVideo = quizData.globalBackgroundVideoUrl;
  const globalBgImage = quizData.globalBackgroundImageUrl;
  const finalVideoUrl = sceneBgVideo !== undefined ? sceneBgVideo : globalBgVideo;
  const finalImageUrl = sceneBgImage !== undefined ? sceneBgImage : globalBgImage;

  return (
    <div className="quiz-viewport bg-slate-900"> {/* Base color */}

      {/* Background Layer */}
      <div className="absolute-fill -z-10"> {/* Lowest layer */}
        {finalVideoUrl ? (
          <video
            key={`bg-vid-${finalVideoUrl}`}
            src={finalVideoUrl}
            autoPlay muted loop playsInline
            className="absolute-fill object-cover"
            onError={(e) => console.error("Background video error:", finalVideoUrl, e)}
          />
        ) : finalImageUrl ? (
          <img
            key={`bg-img-${finalImageUrl}`}
            src={finalImageUrl}
            alt="" // Alt text is optional for purely decorative backgrounds
            className="absolute-fill object-cover"
            loading="lazy" // Lazy load background images
            onError={(e) => console.error("Background image error:", finalImageUrl, e)}
          />
        ) : (
          <div className="absolute-fill bg-gradient-to-br from-slate-800 to-slate-950"></div> // Fallback gradient
        )}
      </div>

      {/* Global Music Player */}
      {quizData.backgroundMusic && <audio ref={globalBackgroundMusicRef} preload="auto" />}

      {/* Animated Scene Container */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          // IMPORTANT KEY: Ensures component remounts when scene changes
          key={`${quizSessionId}-${currentSceneData.sceneId}-${currentSceneIndex}`}
          className="absolute-fill z-0" // Scene content sits above background
          initial={{ opacity: 0, x: "30%" }} // Start slightly off-screen right
          animate={{ opacity: 1, x: "0%" }} // Slide in to center
          exit={{ opacity: 0, x: "-30%" }} // Slide out to left
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }} // Ease out cubic
        >
          <SceneComponent
            // Pass all specific props for the scene variant
            {...sceneProps}
            // Pass essential context props
            sceneId={currentSceneData.sceneId}
            durationInSeconds={currentSceneData.durationInSeconds}
            onSceneEnd={handleSceneEnd}
            // Pass resolved backgrounds (scenes can still use their own logic)
            backgroundVideoUrl={finalVideoUrl} // Pass the decided URL
            backgroundImageUrl={finalImageUrl} // Pass the decided URL
            // Pass globals if needed for deeper fallback inside scene
            globalBackgroundImageUrl={quizData.globalBackgroundImageUrl}
            globalBackgroundVideoUrl={quizData.globalBackgroundVideoUrl}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;