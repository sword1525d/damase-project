
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { Circle, Crown } from "lucide-react";
import { doc } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface PlayerInfoProps {
  playerId?: string;
  opponentId?: string;
  gameSession: any;
}

const TURN_DURATION = 30; // 30 segundos

function PlayerDetails({ userId, isPlayer, gameSession }: { userId?: string, isPlayer: boolean, gameSession: any }) {
  const firestore = useFirestore();
  const [timer, setTimer] = useState(TURN_DURATION);
  const { data: user } = useDoc(useMemoFirebase(() => userId ? doc(firestore, `users/${userId}/profile`, 'main') : null, [firestore, userId]));
  
  const isMyTurn = gameSession.turn === userId;
  const areBothPlayersPresent = !!(gameSession?.presentPlayers?.[gameSession.player1Id] && gameSession?.presentPlayers?.[gameSession.player2Id]);
  const isTimerActive = isMyTurn && areBothPlayersPresent && gameSession.status === 'active';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      setTimer(TURN_DURATION); // Reset timer on turn change
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Handle timeout logic here (e.g., auto-forfeit)
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimer(TURN_DURATION);
    }

    return () => clearInterval(interval);
  }, [isTimerActive]);

  const pieceCounts = useMemo(() => {
    const playerKey = gameSession.player1Id === userId ? 'p1' : 'p2';
    let normal = 0;
    let kings = 0;
    const board = gameSession.board;
    if (board) {
        for(let r = 0; r < 8; r++){
            for(let c = 0; c < 8; c++){
                const piece = board[r]?.[c];
                if(piece && piece.player === playerKey){
                    if(piece.isKing) kings++;
                    else normal++;
                }
            }
        }
    }
    return { normal, kings };
  }, [gameSession.board, userId, gameSession.player1Id]);

  const timerProgress = (timer / TURN_DURATION) * 100;
  const turnStatus = isMyTurn ? "Sua vez" : "Aguardando...";
  const displayName = isPlayer ? 'Você' : user?.displayName || 'Oponente';

  return (
    <div className={`flex flex-col gap-2 ${isPlayer ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 md:gap-4 ${isPlayer ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
                <Avatar className={cn(
                    "w-12 h-12 md:w-16 md:h-16 border-2",
                    isMyTurn ? 'border-primary' : 'border-muted'
                    )}>
                <AvatarImage src={user?.avatarUrl} alt={displayName} data-ai-hint="avatar" />
                <AvatarFallback>{displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                {user?.level && (
                    <Badge variant="secondary" className="absolute -bottom-1 -right-1 h-6 w-6 p-0 justify-center text-xs rounded-full border-2 border-card">
                        {user.level}
                    </Badge>
                )}
            </div>
            <div className={cn("flex-1", isPlayer ? "text-right" : "text-left")}>
                <h3 className="font-semibold text-lg truncate">{displayName}</h3>
                <div className={cn(
                    "flex items-center gap-3 text-muted-foreground text-sm",
                     isPlayer ? 'justify-end' : 'justify-start',
                     )}>
                    <span className="flex items-center gap-1"><Circle className="w-4 h-4 fill-current" /> {pieceCounts.normal}</span>
                    <span className="flex items-center gap-1"><Crown className="w-4 h-4" /> {pieceCounts.kings}</span>
                </div>
            </div>
        </div>
        <div className="w-full h-6 flex flex-col items-center">
             {isMyTurn && <p className="text-xs text-primary font-semibold mb-1">{turnStatus}</p>}
             <Progress value={isTimerActive ? timerProgress : 0} className={`w-full h-1.5 transition-all duration-1000 ease-linear ${isTimerActive ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    </div>
  );
}


export function PlayerInfo({ playerId, opponentId, gameSession }: PlayerInfoProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
       <div className="grid grid-cols-[1fr_auto_1fr] items-start p-2 md:p-4 bg-card rounded-lg shadow-md gap-2 md:gap-4">
        <PlayerDetails userId={opponentId} isPlayer={false} gameSession={gameSession} />
        
        <div className="text-center pt-8">
            <h2 className="text-lg md:text-xl font-bold text-accent">VS</h2>
        </div>

        <PlayerDetails userId={playerId} isPlayer={true} gameSession={gameSession} />
      </div>
    </div>
  );
}
