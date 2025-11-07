"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Crown } from "lucide-react";
import { doc } from "firebase/firestore";

interface PlayerInfoProps {
  playerId?: string;
  opponentId?: string;
}

function PlayerDetails({ userId, isPlayer, isMyTurn }: { userId?: string, isPlayer: boolean, isMyTurn?: boolean }) {
  const firestore = useFirestore();
  const userProfileRef = useMemoFirebase(() => {
    if (!userId) return null;
    return doc(firestore, `users/${userId}/profile`, "main");
  }, [firestore, userId]);
  const { data: userProfile } = useDoc(userProfileRef);

  return (
    <div className={`flex items-center gap-4 ${isPlayer ? 'flex-row-reverse text-right' : ''}`}>
      <div className="relative">
        <Avatar className={`w-12 h-12 md:w-16 md:h-16 border-2 ${isPlayer ? 'border-primary' : 'border-muted'}`}>
          <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.displayName || "Avatar"} data-ai-hint="avatar" />
          <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        {isPlayer && isMyTurn && (
          <div className="absolute -bottom-1 -right-1 bg-background px-1.5 py-0.5 rounded-full text-xs font-semibold border border-primary text-primary">
              Your Turn
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-md md:text-lg">{isPlayer ? 'You' : userProfile?.displayName || 'Opponent'}</h3>
        <div className={`flex items-center gap-2 text-muted-foreground text-sm ${isPlayer ? 'justify-end' : ''}`}>
            <span>Pieces: 12</span>
            <span className="flex items-center gap-1"><Crown className="w-4 h-4" /> 0</span>
        </div>
      </div>
    </div>
  );
}


export function PlayerInfo({ playerId, opponentId }: PlayerInfoProps) {
  const { user } = useUser();

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <div className="flex justify-between items-center p-4 bg-card rounded-lg shadow-md">
        <PlayerDetails userId={opponentId} isPlayer={false} />
        
        <div className="text-center">
            <h2 className="text-xl font-bold text-accent-foreground">VS</h2>
        </div>

        <PlayerDetails userId={playerId} isPlayer={true} isMyTurn={true} />
      </div>
    </div>
  );
}
