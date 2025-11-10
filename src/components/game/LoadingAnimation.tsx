"use client";

import { cn } from "@/lib/utils";

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <style>
            {`
            @keyframes jump-and-capture {
                0%, 100% { transform: translate(0, 0); }
                15% { transform: translate(50px, -30px); }
                25% { transform: translate(100px, 0); opacity: 1; }
                26% { opacity: 0; }
                27% { transform: translate(100px, 0); opacity: 1; }
                40% { transform: translate(150px, -30px); }
                50% { transform: translate(200px, 0); }
            }
            @keyframes fade-out-1 {
                15% { opacity: 1; }
                25% { opacity: 0; }
                100% { opacity: 0; }
            }
            @keyframes fade-out-2 {
                40% { opacity: 1; }
                50% { opacity: 0; }
                100% { opacity: 0; }
            }
            .piece-jumper { animation: jump-and-capture 3s ease-in-out infinite; }
            .piece-captured-1 { animation: fade-out-1 3s ease-in-out infinite; }
            .piece-captured-2 { animation: fade-out-2 3s ease-in-out infinite; }
            `}
        </style>
        <svg width="220" height="60" viewBox="0 0 220 60" className="drop-shadow-lg">
            {/* Jumping Piece */}
            <circle cx="20" cy="40" r="18" fill="#facc15" className="piece-jumper" stroke="#172131" strokeWidth="3" />

            {/* Captured Pieces */}
            <circle cx="120" cy="40" r="18" fill="#A0522D" className="piece-captured-1" stroke="#6F381D" strokeWidth="3" />
            <circle cx="220" cy="40" r="18" fill="#A0522D" className="piece-captured-2" stroke="#6F381D" strokeWidth="3" />

             {/* Placeholder positions for illusion */}
            <circle cx="120" cy="40" r="18" fill="transparent" />
            <circle cx="220" cy="40" r="18" fill="transparent" />
        </svg>
        <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
    </div>
  );
}
