
'use client';
import { PlayerInfo } from "./PlayerInfo";
import { CheckersBoard } from "./CheckersBoard";
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function GameArea() {
  const firestore = useFirestore();
  const { user } = useUser();
  // For now, let's hardcode a game session ID for development
  const gameSessionId = "test-session"; 

  const gameSessionRef = useMemoFirebase(() => {
      if (!gameSessionId) return null;
      return doc(firestore, 'game_sessions', gameSessionId);
  }, [firestore, gameSessionId]);
  
  const { data: gameSession, isLoading } = useDoc(gameSessionRef);

  const player1Id = gameSession?.player1Id;
  const player2Id = gameSession?.player2Id;

  const opponentId = user?.uid === player1Id ? player2Id : player1Id;

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading game...</div>
  }

  return (
    <div className="flex-1 flex flex-col p-4 pt-20 md:p-6 lg:p-8 lg:pt-8 items-center justify-center">
      <PlayerInfo playerId={user?.uid} opponentId={opponentId} />
      <CheckersBoard gameSession={gameSession} gameSessionRef={gameSessionRef} />
    </div>
  );
}
