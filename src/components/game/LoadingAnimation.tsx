"use client";

import { cn } from "@/lib/utils";

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <style>
            {`
            @keyframes checker-jump {
                0% { transform: translate(0, 0); }
                50% { transform: translate(50px, -50px) scale(1.1); }
                100% { transform: translate(100px, 0); }
            }
            @keyframes piece-fade-out {
                49% { opacity: 1; }
                50%, 100% { opacity: 0; }
            }
            .piece-jumper {
                animation: checker-jump 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            }
            .piece-captured {
                animation: piece-fade-out 1.5s ease-in-out infinite;
            }
            `}
        </style>
        <svg width="150" height="70" viewBox="0 0 150 70" className="drop-shadow-lg">
            {/* Mini board */}
            <rect x="0" y="0" width="50" height="50" fill="#DEB887" />
            <rect x="50" y="0" width="50" height="50" fill="#8B4513" />
            <rect x="100" y="0" width="50" height="50" fill="#DEB887" />

            {/* Captured Piece */}
            <g transform="translate(25, 25)">
                 <circle cx="50" cy="0" r="18" fill="#A0522D" className="piece-captured" stroke="#6F381D" strokeWidth="3" />
            </g>

            {/* Jumping Piece */}
            <g transform="translate(25, 25)">
                <circle cx="0" cy="0" r="18" fill="#facc15" className="piece-jumper" stroke="#172131" strokeWidth="3" />
            </g>
        </svg>
        <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
    </div>
  );
}
