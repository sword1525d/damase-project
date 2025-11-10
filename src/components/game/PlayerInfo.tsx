
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Circle, Crown } from "lucide-react";
import { doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PlayerInfoProps {
  playerId?: string;
  opponentId?: string;
  isMyTurn?: boolean;
  bothPlayersPresent?: boolean;
}

const TURN_DURATION = 30; // 30 segundos

function PlayerDetails({ userId, isPlayer, isMyTurn, bothPlayersPresent }: { userId?: string, isPlayer: boolean, isMyTurn?: boolean, bothPlayersPresent?: boolean }) {
  const firestore = useFirestore();
  const [timer, setTimer] = useState(TURN_DURATION);

  const userProfileRef = useMemoFirebase(() => {
    if (!userId) return null;
    return doc(firestore, `users/${userId}/profile`, "main");
  }, [firestore, userId]);
  const { data: userProfile } = useDoc(userProfileRef);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMyTurn && bothPlayersPresent) {
      setTimer(TURN_DURATION);
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Lidar com o tempo de turno esgotado aqui
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimer(TURN_DURATION);
    }

    return () => clearInterval(interval);
  }, [isMyTurn, bothPlayersPresent]);

  const timerProgress = (timer / TURN_DURATION) * 100;

  return (
    <div className={`flex flex-col gap-2 ${isPlayer ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 md:gap-4 ${isPlayer ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
                <Avatar className={cn(
                    "w-12 h-12 md:w-16 md:h-16 border-2",
                    isMyTurn ? 'border-primary' : 'border-muted'
                    )}>
                <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.displayName || "Avatar"} data-ai-hint="avatar" />
                <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
            </div>
            <div className={cn("flex-1", isPlayer ? "text-right" : "text-left")}>
                <h3 className="font-semibold text-lg truncate hidden md:block">{isPlayer ? 'Você' : userProfile?.displayName || 'Oponente'}</h3>
                <div className={cn(
                    "flex items-center gap-3 text-muted-foreground text-sm",
                     isPlayer ? 'justify-end' : 'justify-start',
                     'hidden md:flex'
                     )}>
                    <span className="flex items-center gap-1"><Circle className="w-4 h-4 fill-current" /> 12</span>
                    <span className="flex items-center gap-1"><Crown className="w-4 h-4" /> 0</span>
                </div>
                 <div className="md:hidden flex gap-2">
                    <p className="text-sm flex items-center gap-1"><Circle className="w-3 h-3 fill-current" /> 12</p>
                    <p className="text-sm flex items-center gap-1"><Crown className="w-4 h-4" /> 0</p>
                </div>
            </div>
        </div>
        <Progress value={(isMyTurn && bothPlayersPresent) ? timerProgress : 0} className={`w-full h-1.5 transition-all duration-1000 ease-linear ${(isMyTurn && bothPlayersPresent) ? '' : 'opacity-0'}`} />
    </div>
  );
}


export function PlayerInfo({ playerId, opponentId, isMyTurn, bothPlayersPresent }: PlayerInfoProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
       <div className="grid grid-cols-[1fr_auto_1fr] items-start p-2 md:p-4 bg-card rounded-lg shadow-md gap-2 md:gap-4">
        <PlayerDetails userId={opponentId} isPlayer={false} isMyTurn={!isMyTurn} bothPlayersPresent={bothPlayersPresent} />
        
        <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-accent">VS</h2>
        </div>

        <PlayerDetails userId={playerId} isPlayer={true} isMyTurn={isMyTurn} bothPlayersPresent={bothPlayersPresent} />
      </div>
    </div>
  );
}
