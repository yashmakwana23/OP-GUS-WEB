// src/components/CircularTimer.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
	remainingSeconds: number;
	totalDurationSeconds: number;
	size?: number;
	strokeWidth?: number;
	trackColor?: string;
	progressColor?: string;
	textColor?: string;
	fontFamily?: string;
	fontWeight?: string | number;
	innerBackgroundColor?: string;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
	remainingSeconds, totalDurationSeconds,
	size = 60, strokeWidth = 6,
	trackColor = 'rgba(255, 255, 255, 0.2)', progressColor = '#ffd700',
	textColor = 'white', fontFamily = '"Poppins", sans-serif', fontWeight = 'bold',
	innerBackgroundColor = 'rgba(0, 0, 0, 0.4)',
}) => {
    if (totalDurationSeconds <= 0) return null;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const progressValue = Math.max(0, Math.min(1, remainingSeconds / totalDurationSeconds));
	const offset = circumference - progressValue * circumference;
	const displaySeconds = Math.max(0, Math.ceil(remainingSeconds));
    let currentProgressColor = progressColor;
    if (remainingSeconds / totalDurationSeconds < 0.2) currentProgressColor = '#e74c3c';
    else if (remainingSeconds / totalDurationSeconds < 0.5) currentProgressColor = '#f39c12';

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.4))' }}>
			<circle cx={size / 2} cy={size / 2} r={radius} fill={innerBackgroundColor}/>
			<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth}/>
			<motion.circle
				cx={size / 2} cy={size / 2} r={radius} fill="none"
				stroke={currentProgressColor} strokeWidth={strokeWidth}
				strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.3, ease: "linear" }}
				strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
			/>
			<text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={textColor}
				fontSize={size * 0.42} fontFamily={fontFamily} fontWeight={fontWeight} dy=".1em">
				{displaySeconds}
			</text>
		</svg>
	);
};