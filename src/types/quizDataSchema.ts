// src/types/quizDataSchema.ts
import { z } from 'zod';

// --- Base Schemas ---
const baseSceneSchema = z.object({
	sceneId: z.string().min(1),
	durationInSeconds: z.number().positive(),
});

const qnaBaseOptionSchema = z.object({
	id: z.string().length(1), // A, B, C, D etc.
});

// Base QnA Core props definition (OBJECT ONLY, NO REFINE HERE)
const qnaCoreObjectSchema = z.object({
	// Allow string, null, or undefined
	questionText: z.string().nullable().optional(), // <<< MODIFIED: Added .nullable()
	correctAnswerId: z.string().length(1),
	timerDuration: z.number().positive().gte(1).optional(),
	correctAnswerReasoning: z.string().optional(),
	// Ensure referenceImageUrl is also nullable/optional (it already was)
	referenceImageUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
	titleText: z.string().optional(),
    // Common optional styling props for variants
    backgroundUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
    backgroundVideoUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
	crewImageUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
    logoUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
    // Background Overlay Controls
    enableOverlay: z.boolean().optional().default(false),
    overlayColor: z.string().startsWith('rgba(').optional().default('rgba(0, 0, 0, 0.4)'),
});


// --- Specific Option/Prop Schemas ---

// PinkGridQuiz (Text Options)
export const pinkGridOptionSchema = qnaBaseOptionSchema.extend({
	text: z.string(),
});
export const pinkGridQuizPropsSchema = qnaCoreObjectSchema.extend({
    questionText: z.string(), // Override: Question text is REQUIRED (not null/undefined) for V1
	options: z.array(pinkGridOptionSchema).min(2).max(4),
}).refine(data => !(data.backgroundUrl && data.backgroundVideoUrl), {
	message: "Cannot provide both backgroundUrl and backgroundVideoUrl in PinkGridQuiz props",
	path: ["backgroundUrl", "backgroundVideoUrl"],
});

// PinkGridImageQuiz (Image Options)
export const pinkGridImageOptionSchema = qnaBaseOptionSchema.extend({
	text: z.string().optional(),
	imageUrl: z.string().url().or(z.string().startsWith('/')),
});
export const pinkGridImageQuizPropsSchema = qnaCoreObjectSchema.extend({
    questionText: z.string(), // Override: Question text is REQUIRED for this variant
	options: z.array(pinkGridImageOptionSchema).min(2).max(4),
}).refine(data => !(data.backgroundUrl && data.backgroundVideoUrl), {
	message: "Cannot provide both backgroundUrl and backgroundVideoUrl in PinkGridImageQuiz props",
	path: ["backgroundUrl", "backgroundVideoUrl"],
});

// PinkGridQuizV2 (Text Options, Grid, Img Above Text)
export const pinkGridQuizV2PropsSchema = qnaCoreObjectSchema.extend({
	// questionText and referenceImageUrl are already nullable/optional from core
	options: z.array(pinkGridOptionSchema).min(2).max(4),
}).refine(data => !!data.questionText || !!data.referenceImageUrl, { // <<< MODIFIED: Use truthiness check for refine
    message: "Must provide either questionText or referenceImageUrl (or both) for PinkGridQuizV2",
    path: ["questionText", "referenceImageUrl"],
}).refine(data => !(data.backgroundUrl && data.backgroundVideoUrl), {
	message: "Cannot provide both backgroundUrl and backgroundVideoUrl in PinkGridQuizV2 props",
	path: ["backgroundUrl", "backgroundVideoUrl"],
});

// BeigeGridQuiz (Text Options)
export const beigeGridOptionSchema = qnaBaseOptionSchema.extend({
	text: z.string(),
});
export const beigeGridQuizPropsSchema = qnaCoreObjectSchema.extend({
    questionText: z.string(), // Override: Question text is REQUIRED for Beige
	options: z.array(beigeGridOptionSchema).min(2).max(4),
}).refine(data => !(data.backgroundUrl && data.backgroundVideoUrl), {
	message: "Cannot provide both backgroundUrl and backgroundVideoUrl in BeigeGridQuiz props",
	path: ["backgroundUrl", "backgroundVideoUrl"],
});

// IntroSceneV1 props
export const introV1PropsSchema = z.object({
	characterName: z.string().optional(),
	headingText: z.string().optional(),
	subheadingText: z.string().optional(),
	backgroundImageUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
	backgroundVideoUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
}).refine(data => !(data.backgroundImageUrl && data.backgroundVideoUrl), {
	message: "Cannot provide both backgroundImageUrl and backgroundVideoUrl in Intro props",
	path: ["backgroundImageUrl", "backgroundVideoUrl"],
});

// OutroSceneV1 props
export const outroV1PropsSchema = z.object({
	scoreText: z.string(),
	callToAction: z.string(),
	backgroundImageUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
	backgroundVideoUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
}).refine(data => !(data.backgroundImageUrl && data.backgroundVideoUrl), {
	message: "Cannot provide both backgroundImageUrl and backgroundVideoUrl in Outro props",
	path: ["backgroundImageUrl", "backgroundVideoUrl"],
});


// --- Final Scene Schemas ---
export const introSceneV1Schema = baseSceneSchema.extend({
	sceneType: z.literal('Intro'), variant: z.literal('V1'), props: introV1PropsSchema,
});
export const outroSceneV1Schema = baseSceneSchema.extend({
	sceneType: z.literal('Outro'), variant: z.literal('OutroV1'), props: outroV1PropsSchema,
});
export const pinkGridQuizSceneSchema = baseSceneSchema.extend({
	sceneType: z.literal('QnA'), variant: z.literal('PinkGridQuiz'), props: pinkGridQuizPropsSchema,
});
export const pinkGridImageQuizSceneSchema = baseSceneSchema.extend({
    sceneType: z.literal('QnA'), variant: z.literal('PinkGridImageQuiz'), props: pinkGridImageQuizPropsSchema,
});
export const beigeGridQuizSceneSchema = baseSceneSchema.extend({
	sceneType: z.literal('QnA'), variant: z.literal('BeigeGridQuiz'), props: beigeGridQuizPropsSchema,
});
export const pinkGridQuizV2SceneSchema = baseSceneSchema.extend({
	sceneType: z.literal('QnA'), variant: z.literal('PinkGridQuizV2'), props: pinkGridQuizV2PropsSchema,
});

// --- Main Scene Union ---
export const sceneSchema = z.discriminatedUnion('variant', [
	introSceneV1Schema,
	outroSceneV1Schema,
	pinkGridQuizSceneSchema,
	pinkGridImageQuizSceneSchema,
    pinkGridQuizV2SceneSchema,
	beigeGridQuizSceneSchema,
]);

// --- Main Quiz Data Schema ---
const quizDataFullSchema = z.object({
	videoId: z.string().min(1),
	totalDurationInSeconds: z.number().positive(),
	backgroundMusic: z.string().url().or(z.string().startsWith('/')).optional().nullable(),
	globalBackgroundImageUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
	globalBackgroundVideoUrl: z.string().url().or(z.string().startsWith('/')).nullable().optional(),
    scenes: z.array(sceneSchema).min(1),
});
export const quizDataSchema = quizDataFullSchema.refine(data => !(data.globalBackgroundImageUrl && data.globalBackgroundVideoUrl), {
	message: "Cannot provide both globalBackgroundImageUrl and globalBackgroundVideoUrl",
	path: ["globalBackgroundImageUrl", "globalBackgroundVideoUrl"],
});

// --- Inferred Types ---
export type QuizData = z.infer<typeof quizDataSchema>;
export type SceneData = z.infer<typeof sceneSchema>;
export type IntroV1Props = z.infer<typeof introV1PropsSchema>;
export type OutroV1Props = z.infer<typeof outroV1PropsSchema>;
// QnA Prop Types
export type PinkGridQuizProps = z.infer<typeof pinkGridQuizPropsSchema>;
export type PinkGridOption = z.infer<typeof pinkGridOptionSchema>;
export type PinkGridImageQuizProps = z.infer<typeof pinkGridImageQuizPropsSchema>;
export type PinkGridImageOption = z.infer<typeof pinkGridImageOptionSchema>;
export type BeigeGridQuizProps = z.infer<typeof beigeGridQuizPropsSchema>;
export type BeigeGridOption = z.infer<typeof beigeGridOptionSchema>;
export type PinkGridQuizV2Props = z.infer<typeof pinkGridQuizV2PropsSchema>;

// --- Helper Function ---
export function parseQuizData(data: unknown): QuizData {
	try {
		const result = quizDataSchema.safeParse(data);
		if (!result.success) {
			console.error("Zod validation failed:", JSON.stringify(result.error.format(), null, 2));
			throw new Error("Invalid quiz data structure. Check console for details.");
		}
		return result.data;
	} catch (e) {
		console.error("Error during quiz data parsing:", e);
		throw new Error("Failed to parse quiz data.");
	}
}