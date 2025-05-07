// src/components/GridBackground.tsx
import React from 'react';

interface GridBackgroundProps {
	spacing?: number;
	lineThickness?: number;
	color?: string;
	style?: React.CSSProperties;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
	spacing = 50,
	lineThickness = 1,
	color = 'rgba(0, 0, 0, 0.1)',
	style,
}) => {
    // This component renders SVG, which doesn't have direct access to useVideoConfig.
    // For web, we can make it fill its container using CSS.
	// The SVG grid pattern itself can be complex to make truly infinite and performant.
    // A simpler approach for web is using CSS background gradients.

    const gridStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        zIndex: -1, // Ensure it's behind content
        backgroundImage: `
            linear-gradient(to right, ${color} ${lineThickness}px, transparent ${lineThickness}px),
            linear-gradient(to bottom, ${color} ${lineThickness}px, transparent ${lineThickness}px)
        `,
        backgroundSize: `${spacing}px ${spacing}px`,
        ...style,
    };

	return <div style={gridStyle} />;
};