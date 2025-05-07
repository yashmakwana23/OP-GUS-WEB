// src/utils/randomUtils.ts

// Simple seeded random function ( Mulberry32 algorithm implementation )
// Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive)
export const seededRandomFloat = (seedStr: string): number => {
	let seed = 0;
	for (let i = 0; i < seedStr.length; i++) {
		// Simple string hash to seed: Multiply by 31 and add char code. Bitwise OR 0 forces to integer.
		seed = (seed * 31 + seedStr.charCodeAt(i)) | 0;
	}

    // Mulberry32 algorithm
	let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    // Ensure final result is positive and scale to 0-1 range
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// Function to get an integer (useful for index selection, etc.)
// Returns a pseudo-random integer between 0 (inclusive) and max (exclusive)
export const seededRandomInt = (seedStr: string, max: number): number => {
	return Math.floor(seededRandomFloat(seedStr) * max);
}

// If you specifically need the raw 32-bit integer output sometimes:
export const seededRandomRawInt = (seedStr: string): number => {
    let seed = 0;
	for (let i = 0; i < seedStr.length; i++) {
		seed = (seed * 31 + seedStr.charCodeAt(i)) | 0;
	}
	let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return (t ^ t >>> 14) >>> 0;
}