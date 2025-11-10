"use client";

import { cn } from "@/lib/utils";

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <style>
            {`
            @keyframes pendulum {
                0%, 100% { transform: translateX(25px); }
                50% { transform: translateX(-25px); }
            }
            .pendulum-piece {
                animation: pendulum 1.5s ease-in-out infinite;
            }
            `}
        </style>
        <svg width="100" height="50" viewBox="0 0 100 50">
            <g>
                {/* Left Piece (dark) */}
                <circle cx="25" cy="25" r="12" fill="#A0522D" stroke="#6F381D" strokeWidth="2.5" />
                {/* Right Piece (dark) */}
                <circle cx="75" cy="25" r="12" fill="#A0522D" stroke="#6F381D" strokeWidth="2.5" />
                {/* Moving Piece (light) */}
                <circle cx="50" cy="25" r="12" fill="#D2B48C" stroke="#B89C74" strokeWidth="2.5" className="pendulum-piece drop-shadow-lg" />
            </g>
        </svg>
        <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
    </div>
  );
}
