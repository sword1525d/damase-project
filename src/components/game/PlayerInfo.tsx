"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Crown } from "lucide-react";
import { doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PlayerInfoProps {
  playerId?: string;
  opponentId?: string;
  isMyTurn?: boolean;
}

const TURN_DURATION = 30; // 30 seconds

function PlayerDetails({ userId, isPlayer, isMyTurn }: { userId?: string, isPlayer: boolean, isMyTurn?: boolean }) {
  const firestore = useFirestore();
  const [timer, setTimer] = useState(TURN_DURATION);

  const userProfileRef = useMemoFirebase(() => {
    if (!userId) return null;
    return doc(firestore, `users/${userId}/profile`, "main");
  }, [firestore, userId]);
  const { data: userProfile } = useDoc(userProfileRef);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMyTurn) {
      setTimer(TURN_DURATION);
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Handle turn timeout here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimer(TURN_DURATION);
    }

    return () => clearInterval(interval);
  }, [isMyTurn]);

  const timerProgress = (timer / TURN_DURATION) * 100;

  return (
    <div className={`flex flex-col ${isPlayer ? 'items-end' : 'items-start'}`}>
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
            <h3 className="font-semibold text-lg truncate hidden md:block">{isPlayer ? 'You' : userProfile?.displayName || 'Opponent'}</h3>
            <div className={cn(
                "flex items-center gap-2 text-muted-foreground text-sm",
                 isPlayer ? 'justify-end' : 'justify-start',
                 'hidden md:flex'
                 )}>
                <span>Pieces: 12</span>
                <span className="flex items-center gap-1"><Crown className="w-4 h-4" /> 0</span>
            </div>
        </div>
        </div>
        <div className={`mt-2 flex items-center gap-2 w-full ${isPlayer ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm font-mono w-6 text-center">{isMyTurn ? timer : ''}</span>
            <Progress value={isMyTurn ? timerProgress : 0} className={`w-full h-1.5 transition-all duration-1000 ease-linear ${isMyTurn ? '' : 'opacity-0'}`} />
        </div>
    </div>
  );
}


export function PlayerInfo({ playerId, opponentId, isMyTurn }: PlayerInfoProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <div className="flex justify-between items-start p-2 md:p-4 bg-card rounded-lg shadow-md gap-4">
        <div className="w-[45%]">
            <PlayerDetails userId={opponentId} isPlayer={false} isMyTurn={!isMyTurn} />
        </div>
        
        <div className="text-center pt-4 md:pt-6">
            <h2 className="text-lg md:text-xl font-bold text-accent-foreground">VS</h2>
        </div>

        <div className="w-[45%]">
            <PlayerDetails userId={playerId} isPlayer={true} isMyTurn={isMyTurn} />
        </div>
      </div>
    </div>
  );
}
