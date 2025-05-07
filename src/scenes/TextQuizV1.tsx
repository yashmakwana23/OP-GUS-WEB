// src/QuizVideo.tsx
import React from 'react';
import {
	AbsoluteFill, Sequence, Audio, staticFile,
	useVideoConfig, Img, OffthreadVideo
} from 'remotion';
import type { QuizData, SceneData } from './types/quizDataSchema';

// Import ALL possible scene components
import { IntroSceneV1 } from './QNA/IntroSceneV1';
import { TextQuizV1 } from './QNA/TextQuizV1';
import { ImageQuizV1 } from './QNA/ImageQuizV1';
import { OutroSceneV1 } from './QNA/OutroSceneV1';
import { PinkGridQuiz } from './QNA/PinkGridQuiz';
import { BeigeGridQuiz } from './QNA/BeigeGridQuiz';
import { PinkGridImageQuiz } from './QNA/PinkGridImageQuiz'; // <<< Import New Component

// Define the mapping using variant names as keys
// ========= CHANGE HERE =========
const sceneComponentMap = {
	// Intro Variants
	V1: IntroSceneV1,
	// QnA Variants
	TextQuizV1: TextQuizV1,
	ImageQuizV1: ImageQuizV1,
	PinkGridQuiz: PinkGridQuiz,
	BeigeGridQuiz: BeigeGridQuiz,
	PinkGridImageQuiz: PinkGridImageQuiz, // <<< Add New Mapping
	// Outro Variants
	OutroV1: OutroSceneV1,
};
// ========= END CHANGE =========


export const QuizVideo: React.FC<QuizData> = (quizData) => {
	const { fps } = useVideoConfig();
	let accumulatedDurationInFrames = 0;

	// Component selection logic using the map
	const getSceneComponentAndProps = (scene: SceneData): { Component: React.FC<any> | null, props: any } => {
		// @ts-ignore - Accessing map using variant string key is expected here
		const Component = sceneComponentMap[scene.variant] ?? null;
		const props = { ...(scene.props ?? {}) };

		if (!Component) {
			console.warn(`No component found for scene variant: ${scene.variant}`);
		}

		return { Component, props };
	};

	if (!quizData || !Array.isArray(quizData.scenes)) {
		console.error('Invalid quizData passed to QuizVideo component.');
		return <AbsoluteFill style={{backgroundColor: 'red'}}><div style={{color: 'white', fontSize: 40, textAlign: 'center', marginTop: 100}}>Error: Invalid Quiz Data Provided</div></AbsoluteFill>;
	}

	return (
		<AbsoluteFill>
			{/* Scenes Layer */}
			{quizData.scenes.map((scene) => {
				const { Component: SceneComponent, props: componentProps } = getSceneComponentAndProps(scene);
				if (!SceneComponent) {
					console.error(`Skipping scene ${scene.sceneId} due to missing component for variant ${scene.variant}`);
					return null;
				}
				const sceneDurationInFrames = Math.round(scene.durationInSeconds * fps);
				if (sceneDurationInFrames <= 0) {
                    console.warn(`Scene ${scene.sceneId} has invalid duration: ${scene.durationInSeconds}s. Skipping.`);
                    return null;
                };
				const sequenceStartFrame = accumulatedDurationInFrames;
				accumulatedDurationInFrames += sceneDurationInFrames;
				const finalProps = { ...componentProps, durationInFrames: sceneDurationInFrames };

				return (
					<Sequence
						key={scene.sceneId}
						from={sequenceStartFrame}
						durationInFrames={sceneDurationInFrames}
						name={`${scene.sceneType} (${scene.variant})`}
					>
						<SceneComponent {...finalProps} />
					</Sequence>
				);
			})}
			{/* Global Music Layer */}
			{quizData.backgroundMusic && (
				<Audio src={staticFile(quizData.backgroundMusic)} volume={0.05} loop style={{zIndex: 100}}/>
			)}
		</AbsoluteFill>
	);
};