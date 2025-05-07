// src/components/RippleBackground.tsx
import React from 'react';
import './RippleBackground.css'; // We'll create this CSS file next

interface RippleBackgroundProps {
    // Props from original are mostly irrelevant for this CSS version
    // Keep seed if you want to use it for slightly different animation timings/colors later
    seed?: string;
    color?: string; // Allow customizing the ripple color
    count?: number; // Number of ripple layers
}

export const RippleBackground: React.FC<RippleBackgroundProps> = ({
    color = 'rgba(190, 195, 205, 0.5)', // Default similar to original base
    count = 5,
}) => {

    // Generate multiple divs for layered ripple effect
    const ripples = Array.from({ length: count }).map((_, index) => {
        const animationDuration = 5 + index * 1.5; // Stagger duration
        const animationDelay = index * 0.5; // Stagger delay

        return (
            <div
                key={index}
                className="ripple-circle"
                style={{
                    // Directly use CSS variables or inline styles for customization
                    borderColor: color,
                    animationDuration: `${animationDuration}s`,
                    animationDelay: `${animationDelay}s`,
                }}
            />
        );
    });

    return (
        <div className="absolute-fill ripple-container -z-10"> {/* Ensure it's behind content */}
            {ripples}
        </div>
    );
};