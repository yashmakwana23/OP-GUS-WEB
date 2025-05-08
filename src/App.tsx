// src/App.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; // Import useCallback
import { parseQuizData, QuizData } from './types/quizDataSchema';
import { AnimatePresence, motion } from 'framer-motion';

// --- Scene Component Imports ---
import { PinkGridQuizV2Scene } from './scenes/PinkGridQuizV2Scene';
import { OutroSceneV1 } from './scenes/OutroSceneV1';

const sceneComponentMap: Record<string, React.FC<any>> = {
  "PinkGridQuizV2": PinkGridQuizV2Scene,
  "OutroV1": OutroSceneV1,
};

const App: React.FC = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userScores, setUserScores] = useState<Record<string, { isCorrect: boolean | null, sceneId: string }>>({});
  const [quizSessionId, setQuizSessionId] = useState(() => Date.now().toString());

  const globalBackgroundMusicRef = useRef<HTMLAudioElement>(null);
  const isGlobalMusicPlayingRef = useRef(false); // To track if we initiated play

  // --- Data Fetching ---
  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true); setError(null);
      try {
        const response = await fetch(`/quiz_data.json?v=${Date.now()}`);
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
        const rawData = await response.json();
        const validatedData = parseQuizData(rawData);
        setQuizData(validatedData);
        setUserScores({});
        setCurrentSceneIndex(0);
        setQuizSessionId(Date.now().toString());
        isGlobalMusicPlayingRef.current = false; // Reset on new data
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
    if (audioEl) {
      const musicSrc = quizData?.backgroundMusic;
      if (musicSrc) {
        if (audioEl.src !== musicSrc) {
          audioEl.src = musicSrc;
          audioEl.load(); // Important: ensure new src is loaded
          isGlobalMusicPlayingRef.current = false; // Reset play attempt flag for new src
        }
        audioEl.volume = 0.05;
        audioEl.loop = true;

        // Attempt to play only if not already initiated by us and is paused
        if (audioEl.paused && !isGlobalMusicPlayingRef.current) {
          audioEl.play()
            .then(() => { isGlobalMusicPlayingRef.current = true; })
            .catch(e => {
              console.warn("Global music autoplay blocked:", e);
              isGlobalMusicPlayingRef.current = false; // Autoplay failed
            });
        } else if (!audioEl.paused) {
            isGlobalMusicPlayingRef.current = true; // Already playing
        }

      } else { // No music source
        if (!audioEl.paused) {
          audioEl.pause();
        }
        audioEl.src = ""; // Clear src if no music
        isGlobalMusicPlayingRef.current = false;
      }
    }
  }, [quizData?.backgroundMusic]); // Re-run only if the music source string changes

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

  // --- Scene Navigation (Stable Callback) ---
  const handleSceneEnd = useCallback((result?: { sceneId: string, isCorrect: boolean | null }) => {
    if (result && quizData) { // quizData is from state, stable between calls unless it actually changes
      const originalSceneId = quizData.scenes.find(s => s.sceneId === result.sceneId)?.sceneId || result.sceneId;
      setUserScores(prev => ({ ...prev, [originalSceneId]: { isCorrect: result.isCorrect, sceneId: originalSceneId } }));
    }

    // Check against quizData directly from state here to ensure it's the latest.
    if (quizData && currentSceneIndex < quizData.scenes.length - 1) {
      setCurrentSceneIndex(prevIndex => prevIndex + 1);
    } else {
      // Use a functional update for userScores if you need the very latest here for logging,
      // or accept that userScores in this log might be from the closure of this useCallback instance.
      // For just logging, it's usually fine.
      console.log("Quiz finished! Final Scores (at time of finish):", userScores);
    }
  }, [quizData, currentSceneIndex, userScores]); // userScores is included because it's used in the "Quiz finished" log.
                                     // If that log was removed or handled differently, userScores could be removed from deps.


  if (isLoading) return <div className="quiz-viewport flex justify-center items-center bg-gray-800 text-white text-xl">Loading Quiz...</div>;
  if (error) return <div className="quiz-viewport flex flex-col justify-center items-center bg-red-800 text-white p-5 text-center"><h2 className="text-2xl font-bold mb-3">Error</h2><p>{error}</p><button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">Reload Page</button></div>;
  if (!quizData || !currentSceneData || !SceneComponent) return <div className="quiz-viewport flex justify-center items-center bg-yellow-600 text-black p-4 text-center font-semibold">Error preparing scene. Check configuration.</div>;

  const appLevelBgVideoUrl = quizData.globalBackgroundVideoUrl;
  const appLevelBgImageUrl = quizData.globalBackgroundImageUrl;
  const sceneSpecificProps = currentSceneData.props || {};

  const componentProps: any = {
    ...sceneSpecificProps,
    sceneId: currentSceneData.sceneId,
    durationInSeconds: currentSceneData.durationInSeconds,
    onSceneEnd: handleSceneEnd, // Now a stable callback
    globalBackgroundImageUrl: quizData.globalBackgroundImageUrl,
    globalBackgroundVideoUrl: quizData.globalBackgroundVideoUrl,
  };

  if ('backgroundImageUrl' in sceneSpecificProps && sceneSpecificProps.backgroundImageUrl !== undefined) {
    componentProps.backgroundImageUrl = sceneSpecificProps.backgroundImageUrl;
  } else if ('backgroundUrl' in sceneSpecificProps && sceneSpecificProps.backgroundUrl !== undefined) {
    componentProps.backgroundImageUrl = sceneSpecificProps.backgroundUrl;
  }

  if ('backgroundVideoUrl' in sceneSpecificProps && sceneSpecificProps.backgroundVideoUrl !== undefined) {
    componentProps.backgroundVideoUrl = sceneSpecificProps.backgroundVideoUrl;
  }

  return (
    <div className="quiz-viewport bg-slate-900">
      <div className="absolute-fill -z-10">
        {appLevelBgVideoUrl ? (
          <video
            key={`app-bg-vid-${appLevelBgVideoUrl}`} // Keyed for replacement, not re-mount on App re-render
            src={appLevelBgVideoUrl} autoPlay muted loop playsInline
            className="absolute-fill object-cover"
            onError={(e) => console.error("App background video error:", appLevelBgVideoUrl, e)}
          />
        ) : appLevelBgImageUrl ? (
          <img
            key={`app-bg-img-${appLevelBgImageUrl}`}
            src={appLevelBgImageUrl} alt="" className="absolute-fill object-cover" loading="lazy"
            onError={(e) => console.error("App background image error:", appLevelBgImageUrl, e)}
          />
        ) : (
          <div className="absolute-fill bg-gradient-to-br from-slate-800 to-slate-950"></div>
        )}
      </div>

      {quizData.backgroundMusic && <audio ref={globalBackgroundMusicRef} preload="auto" />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${quizSessionId}-${currentSceneData.sceneId}-${currentSceneIndex}`} // This key forces re-mount on scene change
          className="absolute-fill z-0"
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