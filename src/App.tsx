// src/App.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { parseQuizData, QuizData } from './types/quizDataSchema';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [quizSessionId, setQuizSessionId] = useState(() => `sid-${Date.now()}`);
  const [hasInteracted, setHasInteracted] = useState(false);

  const globalBackgroundMusicRef = useRef<HTMLAudioElement>(null);
  const lastSetGlobalMusicSrcRef = useRef<string | null | undefined>(null);

  const globalBackgroundVideoRef = useRef<HTMLVideoElement>(null); // Ref for global video
  const lastSetGlobalVideoSrcRef = useRef<string | null | undefined>(null); // Ref to track last set global video src

  // console.log(`APP RENDER - Index: ${currentSceneIndex}, Interacted: ${hasInteracted}`);

  const handlePageClickForInteraction = useCallback(() => {
    if (!hasInteracted) {
      // console.log("APP: Page interaction detected. Unlocking audio.");
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  useEffect(() => {
    document.addEventListener('pointerdown', handlePageClickForInteraction, { once: true });
    return () => document.removeEventListener('pointerdown', handlePageClickForInteraction);
  }, [handlePageClickForInteraction]);

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
      } catch (e: any) {
        console.error("APP: Data loading/parsing error:", e);
        setError(e.message || "Failed to load quiz data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizData();
  }, [quizSessionId]);

  useEffect(() => {
    const audioEl = globalBackgroundMusicRef.current;
    const musicSrc = quizData?.backgroundMusic;
    const musicVolume = quizData?.backgroundMusicVolume ?? 0.05;

    if (audioEl) {
      if (musicSrc) {
        if (lastSetGlobalMusicSrcRef.current !== musicSrc) {
          audioEl.src = musicSrc;
          audioEl.load();
          lastSetGlobalMusicSrcRef.current = musicSrc;
        }
        audioEl.volume = musicVolume;
        audioEl.loop = true;
        if (hasInteracted && audioEl.paused) {
          audioEl.play().catch(e => console.warn(`APP GLOBAL MUSIC: Play failed for ${musicSrc}:`, e.message));
        } else if (!hasInteracted && !audioEl.paused) {
          audioEl.pause();
        }
      } else {
        if (!audioEl.paused) audioEl.pause();
        if (lastSetGlobalMusicSrcRef.current) {
          audioEl.src = "";
          audioEl.load();
          lastSetGlobalMusicSrcRef.current = null;
        }
      }
    }
  }, [quizData, hasInteracted]);

  // Effect to manage global background video playback
  useEffect(() => {
    const videoEl = globalBackgroundVideoRef.current;
    const videoSrc = quizData?.globalBackgroundVideoUrl;

    // console.log(`APP GLOBAL VIDEO effect: Fired. Src: ${videoSrc}, LastSet: ${lastSetGlobalVideoSrcRef.current}`);

    if (videoEl) {
      if (videoSrc) {
        videoEl.style.display = 'block'; // Make sure it's visible
        if (lastSetGlobalVideoSrcRef.current !== videoSrc) {
          // console.log(`APP GLOBAL VIDEO: Setting new SRC: ${videoSrc}`);
          videoEl.src = videoSrc;
          videoEl.load(); // Important for new src
          lastSetGlobalVideoSrcRef.current = videoSrc;
        }
        // autoPlay, muted, loop, playsInline are attributes on the <video> tag
        // but ensure it plays if it was paused for some reason and should be playing
        if (videoEl.paused) {
            videoEl.play().catch(e => console.warn(`App Global BG Video play failed: ${e.message}`));
        }
      } else {
        // No global video src
        if (lastSetGlobalVideoSrcRef.current) { // If there was a src before
          // console.log(`APP GLOBAL VIDEO: Clearing SRC.`);
          videoEl.pause();
          videoEl.removeAttribute('src'); // Clear src
          videoEl.load(); // Unload previous source
          lastSetGlobalVideoSrcRef.current = null;
        }
        videoEl.style.display = 'none'; // Hide the video element
      }
    }
  }, [quizData]); // Depends only on quizData for the URL


  const currentSceneData = useMemo(() => {
    if (!quizData || currentSceneIndex >= quizData.scenes.length) return null;
    return quizData.scenes[currentSceneIndex];
  }, [quizData, currentSceneIndex]);

  const SceneComponent = useMemo(() => {
    if (!currentSceneData) return null;
    const Comp = sceneComponentMap[currentSceneData.variant];
    if (!Comp) {
      setError(`Component not found for "${currentSceneData.variant}".`);
      return null;
    }
    return Comp;
  }, [currentSceneData]);

  const handleSceneEnd = useCallback((result?: { sceneId: string, isCorrect: boolean | null }) => {
    if (result && quizData) {
      const originalSceneId = quizData.scenes.find(s => s.sceneId === result.sceneId)?.sceneId || result.sceneId;
      setUserScores(prev => ({ ...prev, [originalSceneId]: { isCorrect: result.isCorrect, sceneId: originalSceneId }}));
    }
    if (quizData && currentSceneIndex < quizData.scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      console.log("APP: Quiz finished!");
    }
  }, [quizData, currentSceneIndex]);

  if (isLoading) return <div className="quiz-viewport flex justify-center items-center bg-gray-800 text-white text-xl">Loading Quiz...</div>;
  if (error) return (
    <div className="quiz-viewport flex flex-col justify-center items-center bg-red-800 text-white p-5 text-center">
      <h2 className="text-2xl font-bold mb-3">Error</h2><p className="mb-4">{error}</p>
      <button onClick={() => setQuizSessionId(`sid-${Date.now()}`)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">Reload Quiz</button>
    </div>
  );
  if (!quizData || !currentSceneData || !SceneComponent) return <div className="quiz-viewport flex justify-center items-center bg-yellow-600 text-black p-4 text-center font-semibold">Preparing scene...</div>;

  const appLevelBgImageUrl = quizData.globalBackgroundImageUrl;

  const sceneSpecificProps = currentSceneData.props || {};
  const componentProps: any = {
    ...sceneSpecificProps, // Pass all specific props from data
    sceneId: currentSceneData.sceneId,
    durationInSeconds: currentSceneData.durationInSeconds,
    onSceneEnd: handleSceneEnd,
    hasInteracted: hasInteracted,
    // Pass global URLs for potential fallback use within scenes (though App handles the main global BG)
    // These props to scenes might not be strictly needed if App.tsx handles all global backgrounds
    // and scenes only handle their own specific backgrounds.
    globalBackgroundImageUrl: quizData.globalBackgroundImageUrl,
    globalBackgroundVideoUrl: quizData.globalBackgroundVideoUrl, // Scene might use this if its own video is undefined
  };

  // Consolidate specific background prop names
  if ('backgroundImageUrl' in sceneSpecificProps && sceneSpecificProps.backgroundImageUrl !== undefined) {
    componentProps.backgroundImageUrl = sceneSpecificProps.backgroundImageUrl;
  } else if ('backgroundUrl' in sceneSpecificProps && sceneSpecificProps.backgroundUrl !== undefined) {
    componentProps.backgroundImageUrl = sceneSpecificProps.backgroundUrl; // for older schema compatibility
  }
  if ('backgroundVideoUrl' in sceneSpecificProps && sceneSpecificProps.backgroundVideoUrl !== undefined) {
    componentProps.backgroundVideoUrl = sceneSpecificProps.backgroundVideoUrl;
  }


  return (
    <div className="quiz-viewport bg-slate-900">
      <div className="absolute-fill -z-10">
        {/* Global Video managed by useEffect */}
        <video
            ref={globalBackgroundVideoRef}
            key="app-global-bg-vid-managed" // Stable key as it's always rendered
            autoPlay muted loop playsInline
            className="absolute-fill object-cover"
            style={{ display: 'none' }} // Initially hidden, display managed by useEffect
            onError={(e) => console.error("App Global BG video element error:", (e.target as HTMLVideoElement).currentSrc, e)}
        />
        {/* Fallback Global Image if no video is active/set by quizData */}
        {(!quizData?.globalBackgroundVideoUrl && appLevelBgImageUrl) && (
          <img
            key={`app-bg-img-${appLevelBgImageUrl}`} // Key based on URL
            src={appLevelBgImageUrl} alt="" className="absolute-fill object-cover" loading="lazy"
            onError={(e) => console.error("App BG image error:", appLevelBgImageUrl, e)}
          />
        )}
         {/* Fallback gradient if no global image/video at all */}
        {(!quizData?.globalBackgroundVideoUrl && !appLevelBgImageUrl) && (
            <div className="absolute-fill bg-gradient-to-br from-slate-800 to-slate-950"></div>
        )}
      </div>

      {quizData.backgroundMusic && <audio ref={globalBackgroundMusicRef} preload="auto" />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${quizSessionId}-${currentSceneData.sceneId}`}
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