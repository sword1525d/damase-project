"use client";

import { cn } from "@/lib/utils";

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <style>
            {`
            @keyframes checker-slide {
                0%, 100% { transform: translateX(-25px); }
                50% { transform: translateX(25px); }
            }
            @keyframes shadow-slide {
                0%, 100% { transform: translateX(-25px) scaleX(0.8); opacity: 0.5; }
                50% { transform: translateX(25px) scaleX(0.8); opacity: 0.5; }
                25% { transform: translateX(0) scaleX(1); opacity: 0.8; }
                75% { transform: translateX(0) scaleX(1); opacity: 0.8; }
            }
            .piece-slider {
                animation: checker-slide 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
            }
            .shadow-slider {
                animation: shadow-slide 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
            }
            `}
        </style>
        <svg width="100" height="70" viewBox="0 0 100 70">
            {/* Board Square */}
            <rect x="0" y="10" width="100" height="50" fill="#8B4513" rx="5" />
            
            {/* Shadow */}
            <ellipse cx="50" cy="55" rx="15" ry="3" fill="black" className="shadow-slider" />

            {/* Sliding Piece */}
            <g className="piece-slider">
                <circle cx="50" cy="35" r="18" fill="#facc15" stroke="#172131" strokeWidth="3" className="drop-shadow-lg" />
            </g>
        </svg>
        <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
    </div>
  );
}
