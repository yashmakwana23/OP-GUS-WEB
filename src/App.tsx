// src/App.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { parseQuizData, QuizData, SceneData } from './types/quizDataSchema';
import { AnimatePresence, motion } from 'framer-motion';

// --- Scene Component Imports ---
import { PinkGridQuizV2Scene } from './scenes/PinkGridQuizV2Scene';
import { OutroSceneV1 } from './scenes/OutroSceneV1';

// --- Scene Component Map ---
const sceneComponentMap: Record<string, React.FC<any>> = {
  "PinkGridQuizV2": PinkGridQuizV2Scene,
  "OutroV1": OutroSceneV1,
  // Add other scene components here as they are migrated
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
        const response = await fetch(`/quiz_data.json?v=${Date.now()}`);
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
      audioEl.volume = 0.05;
      audioEl.loop = true;
      audioEl.play().catch(e => console.warn("Global music autoplay blocked:", e));
    } else if (audioEl) {
      audioEl.pause();
    }
  }, [quizData?.backgroundMusic]);

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
    if (result && quizData) {
      const originalSceneId = quizData.scenes.find(s => s.sceneId === result.sceneId)?.sceneId || result.sceneId;
      setUserScores(prev => ({ ...prev, [originalSceneId]: { isCorrect: result.isCorrect, sceneId: originalSceneId } }));
    }
    if (quizData && currentSceneIndex < quizData.scenes.length - 1) {
      setCurrentSceneIndex(prevIndex => prevIndex + 1);
    } else {
      console.log("Quiz finished! Final Scores:", userScores);
      // TODO: Implement quiz completion (e.g., show summary, restart button)
    }
  };

  // --- Render Logic ---
  if (isLoading) return <div className="quiz-viewport flex justify-center items-center bg-gray-800 text-white text-xl">Loading Quiz...</div>;
  if (error) return <div className="quiz-viewport flex flex-col justify-center items-center bg-red-800 text-white p-5 text-center"><h2 className="text-2xl font-bold mb-3">Error</h2><p>{error}</p><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">Reload Page</button></div>;
  if (!quizData || !currentSceneData || !SceneComponent) return <div className="quiz-viewport flex justify-center items-center bg-yellow-600 text-black p-4 text-center font-semibold">Error preparing scene. Please check configuration.</div>;

  // Determine App-level global background (serves as a fallback layer)
  const appLevelBgVideoUrl = quizData.globalBackgroundVideoUrl;
  const appLevelBgImageUrl = quizData.globalBackgroundImageUrl;

  // Prepare props for the SceneComponent
  const sceneSpecificProps = currentSceneData.props || {};
  const componentProps: any = {
    ...sceneSpecificProps, // Spread the scene's defined props from quizDataSchema
    sceneId: currentSceneData.sceneId,
    durationInSeconds: currentSceneData.durationInSeconds,
    onSceneEnd: handleSceneEnd,
    // Pass global URLs, scenes can decide if/how to use them as fallbacks
    globalBackgroundImageUrl: quizData.globalBackgroundImageUrl,
    globalBackgroundVideoUrl: quizData.globalBackgroundVideoUrl,
  };

  // Map specific schema prop names to consistent prop names expected by scene components if necessary.
  // Most scenes expect `backgroundImageUrl` and `backgroundVideoUrl` for their specific backgrounds.
  if ('backgroundImageUrl' in sceneSpecificProps && sceneSpecificProps.backgroundImageUrl) {
    componentProps.backgroundImageUrl = sceneSpecificProps.backgroundImageUrl;
  } else if ('backgroundUrl' in sceneSpecificProps && sceneSpecificProps.backgroundUrl) {
    // Map `backgroundUrl` (common in QnA types) to `backgroundImageUrl`
    componentProps.backgroundImageUrl = sceneSpecificProps.backgroundUrl;
  }

  if ('backgroundVideoUrl' in sceneSpecificProps && sceneSpecificProps.backgroundVideoUrl) {
    componentProps.backgroundVideoUrl = sceneSpecificProps.backgroundVideoUrl;
  }
  // `componentProps` now contains all original scene props + resolved background URLs
  // under `backgroundImageUrl` and `backgroundVideoUrl` keys if they were defined.

  return (
    <div className="quiz-viewport bg-slate-900"> {/* Base color for the viewport */}

      {/* App-level Background Layer (uses global settings) */}
      <div className="absolute-fill -z-10"> {/* Lowest layer */}
        {appLevelBgVideoUrl ? (
          <video
            key={`app-bg-vid-${appLevelBgVideoUrl}`}
            src={appLevelBgVideoUrl}
            autoPlay muted loop playsInline
            className="absolute-fill object-cover"
            onError={(e) => console.error("App background video error:", appLevelBgVideoUrl, e)}
          />
        ) : appLevelBgImageUrl ? (
          <img
            key={`app-bg-img-${appLevelBgImageUrl}`}
            src={appLevelBgImageUrl}
            alt="" // Alt text is optional for purely decorative backgrounds
            className="absolute-fill object-cover"
            loading="lazy"
            onError={(e) => console.error("App background image error:", appLevelBgImageUrl, e)}
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
          key={`${quizSessionId}-${currentSceneData.sceneId}-${currentSceneIndex}`}
          className="absolute-fill z-0" // Scene content sits above app background
          initial={{ opacity: 0, x: "30%" }}
          animate={{ opacity: 1, x: "0%" }}
          exit={{ opacity: 0, x: "-30%" }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        >
          <SceneComponent {...componentProps} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;