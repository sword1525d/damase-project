
'use client';
import { PlayerInfo } from "./PlayerInfo";
import { CheckersBoard } from "./CheckersBoard";
import { useFirestore, useDoc, useUser, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { LoadingAnimation } from "./LoadingAnimation";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Users, Flag, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const XP_PER_WIN = 25;
const XP_PER_LEVEL = 100;

async function awardXp(firestore: any, winnerId: string) {
    if (!winnerId || winnerId === 'checkers_bot') return;

    const userProfileRef = doc(firestore, `users/${winnerId}/profile`, "main");

    try {
        await runTransaction(firestore, async (transaction) => {
            const userProfileDoc = await transaction.get(userProfileRef);
            if (!userProfileDoc.exists()) {
                throw "Document does not exist!";
            }

            const currentLevel = userProfileDoc.data().level || 1;
            const currentXp = userProfileDoc.data().xp || 0;

            let newXp = currentXp + XP_PER_WIN;
            let newLevel = currentLevel;

            if (newXp >= XP_PER_LEVEL) {
                newLevel += 1;
                newXp -= XP_PER_LEVEL;
            }
            
            transaction.update(userProfileRef, { level: newLevel, xp: newXp });
        });
    } catch (e) {
        console.error("XP transaction failed: ", e);
    }
}


export function GameArea({ gameId }: { gameId: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [showForfeitDialog, setShowForfeitDialog] = useState(false);

  const gameSessionRef = useMemoFirebase(() => {
      if (!gameId) return null;
      return doc(firestore, 'game_sessions', gameId);
  }, [firestore, gameId]);
  
  const { data: gameSession, isLoading } = useDoc(gameSessionRef);

  // Set user as present in the game
  useEffect(() => {
    if (gameSessionRef && user && gameSession?.status !== 'completed') {
        const presenceUpdate: { [key: string]: boolean } = {};
        presenceUpdate[`presentPlayers.${user.uid}`] = true;
        updateDocumentNonBlocking(gameSessionRef, presenceUpdate);

        const handleBeforeUnload = () => {
             const absenceUpdate: { [key: string]: boolean } = {};
             absenceUpdate[`presentPlayers.${user.uid}`] = false;
             updateDocumentNonBlocking(gameSessionRef, absenceUpdate);
        }

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            handleBeforeUnload(); // Mark as absent when component unmounts
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }
  }, [gameSessionRef, user, gameSession?.status]);

  // Award XP on game completion
  useEffect(() => {
      if(gameSession?.status === 'completed' && gameSession.winnerId) {
        awardXp(firestore, gameSession.winnerId);
      }
  }, [gameSession?.status, gameSession?.winnerId, firestore])


  const player1Id = gameSession?.player1Id;
  const player2Id = gameSession?.player2Id;

  const opponentId = user?.uid === player1Id ? player2Id : player1Id;
  const gameStatus = gameSession?.status;

  const areBothPlayersPresent = gameSession?.botPlayer ? true : !!(gameSession?.presentPlayers?.[player1Id] && gameSession?.presentPlayers?.[player2Id]);


  const handleForfeit = () => {
    if (!gameSessionRef || !opponentId) return;

    const gameUpdate = {
      status: 'completed',
      winnerId: opponentId,
      endTime: new Date().toISOString(),
    };
    updateDocumentNonBlocking(gameSessionRef, gameUpdate);
    setShowForfeitDialog(false);
  }

  if (isLoading || !gameSession) {
    return (
        <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="flex flex-col items-center gap-4">
                <LoadingAnimation />
            </div>
      </div>
    )
  }

  if (gameStatus === 'pending_invite') {
    return (
        <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="flex flex-col items-center gap-4">
                <LoadingAnimation />
                <h2 className="text-2xl font-semibold">Aguardando oponente</h2>
                <p className="text-muted-foreground">O jogo começará assim que seu amigo aceitar o convite.</p>
            </div>
        </div>
    )
  }

  if (!areBothPlayersPresent && gameStatus !== 'completed') {
     return (
        <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <Users className="w-24 h-24 text-muted-foreground" strokeWidth={0.5} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <LoadingAnimation />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Aguardando oponente...</h2>
                    <p className="text-muted-foreground">A partida começará assim que o outro jogador se conectar.</p>
                </div>
            </div>
        </div>
    )
  }


  if (gameStatus === 'completed') {
    const isWinner = gameSession.winnerId === user?.uid;
    const isDraw = gameSession.winnerId === null;
    return (
        <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="flex flex-col items-center gap-6">
                <Trophy className={cn("w-24 h-24", isWinner ? "text-primary" : "text-destructive")} strokeWidth={1} />
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold">
                        {isDraw ? "Empate!" : isWinner ? "Você Venceu!" : "Você Perdeu!"}
                    </h2>
                     {isWinner && gameSession.player2Id !== 'checkers_bot' && <p className="text-primary font-semibold">+25 XP</p>}
                    <p className="text-muted-foreground">A partida foi concluída.</p>
                </div>
                <Button onClick={() => router.push('/dashboard')}>Voltar para o Lobby</Button>
            </div>
        </div>
    )
  }

  if (gameStatus === 'ready' || gameStatus === 'active') {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 items-center justify-center relative">
        <PlayerInfo playerId={user?.uid} opponentId={opponentId} gameSession={gameSession} />
        <CheckersBoard gameSession={gameSession} gameSessionRef={gameSessionRef} />
         <AlertDialog open={showForfeitDialog} onOpenChange={setShowForfeitDialog}>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8">
                      <Flag className="w-4 h-4 mr-2" />
                      Desistir
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Desistir da Partida?</AlertDialogTitle>
                      <AlertDialogDescription>
                          Você tem certeza que quer desistir? Isso contará como uma derrota em seu histórico.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleForfeit} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                          Confirmar Desistência
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </div>
    );
  }

  // Fallback for any other state
  return (
    <div className="flex-1 flex items-center justify-center text-center p-4">
        <div className="flex flex-col items-center gap-4">
            <LoadingAnimation />
            <p className="text-muted-foreground">Carregando partida...</p>
        </div>
    </div>
  );
}
