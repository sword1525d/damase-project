
'use client';
import { PlayerInfo } from "./PlayerInfo";
import { CheckersBoard } from "./CheckersBoard";
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Crown } from "lucide-react";

export function GameArea({ gameId }: { gameId: string }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const gameSessionRef = useMemoFirebase(() => {
      if (!gameId) return null;
      return doc(firestore, 'game_sessions', gameId);
  }, [firestore, gameId]);
  
  const { data: gameSession, isLoading } = useDoc(gameSessionRef);

  const player1Id = gameSession?.player1Id;
  const player2Id = gameSession?.player2Id;

  const opponentId = user?.uid === player1Id ? player2Id : player1Id;
  const isMyTurn = gameSession?.turn === user?.uid;
  const isGameActive = gameSession?.status === 'active';

  if (isLoading || !gameSession) {
    return (
        <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="flex flex-col items-center gap-4">
                <Crown className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Carregando jogo...</p>
            </div>
      </div>
    )
  }

  if (!isGameActive) {
    return (
        <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="flex flex-col items-center gap-4">
                <Crown className="w-12 h-12 text-primary animate-pulse" />
                <h2 className="text-2xl font-semibold">Aguardando oponente</h2>
                <p className="text-muted-foreground">O jogo começará assim que seu amigo aceitar o convite.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-4 pt-20 md:p-6 lg:p-8 items-center justify-center">
      <PlayerInfo playerId={user?.uid} opponentId={opponentId} isMyTurn={isMyTurn} />
      <CheckersBoard gameSession={gameSession} gameSessionRef={gameSessionRef} />
    </div>
  );
}
