
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameInvites } from "@/components/lobby/GameInvites";
import { Swords, Users, Trophy } from "lucide-react";
import { RecentGames } from "./RecentGames";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, limit, orderBy, addDoc, serverTimestamp, deleteDoc, doc as firestoreDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LoadingAnimation } from "../game/LoadingAnimation";
import { useState } from "react";

// Function to generate the initial board state as a map of maps
const generateInitialBoard = () => {
    const board: { [key: number]: { [key: number]: { player: 'p1' | 'p2', isKing: boolean } | null } } = {};
    const p1Rows = [0, 1, 2];
    const p2Rows = [5, 6, 7];

    for (let row = 0; row < 8; row++) {
        board[row] = {};
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 !== 0) {
                if (p1Rows.includes(row)) {
                    board[row][col] = { player: 'p1', isKing: false };
                } else if (p2Rows.includes(row)) {
                    board[row][col] = { player: 'p2', isKing: false };
                } else {
                    board[row][col] = null;
                }
            } else {
                board[row][col] = null;
            }
        }
    }
    return board;
};


export function Lobby({ onFriendMatchClick }: { onFriendMatchClick?: () => void }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isMatchmaking, setIsMatchmaking] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return firestoreDoc(firestore, `users/${user.uid}/profile`, "main");
    }, [firestore, user]);

    const { data: userProfile } = useDoc(userProfileRef);

    const handleCasualMatchmaking = async () => {
        if (!user || !firestore) return;
        
        setIsMatchmaking(true);
        const queueRef = collection(firestore, 'matchmakingQueue');
        // Query to get all players in the queue, oldest first.
        const q = query(queueRef, orderBy('timestamp', 'asc'));

        try {
            const querySnapshot = await getDocs(q);
            // Find the first opponent in the queue who is not the current user.
            const opponentDoc = querySnapshot.docs.find(doc => doc.data().playerId !== user.uid);

            if (opponentDoc) {
                // Found an opponent
                const opponentId = opponentDoc.data().playerId;

                // Remove opponent from queue
                await deleteDoc(opponentDoc.ref);
                
                // Create game session
                const gameSession = {
                    player1Id: opponentId,
                    player2Id: user.uid,
                    status: 'ready',
                    turn: opponentId,
                    createdAt: serverTimestamp(),
                    board: generateInitialBoard(),
                    members: {
                        [user.uid]: true,
                        [opponentId]: true,
                    },
                    presentPlayers: {
                        [user.uid]: true, // Assume present
                        [opponentId]: false,
                    }
                };

                const docRef = await addDoc(collection(firestore, 'game_sessions'), gameSession);
                toast({ title: "Partida encontrada!", description: "Você está sendo redirecionado para o jogo." });
                router.push(`/game/${docRef.id}`);

            } else {
                // No valid opponent found, add to queue and wait, then match with bot
                const myQueueDocRef = firestoreDoc(queueRef, user.uid);
                
                // Check if I'm already in the queue
                const myDoc = await getDoc(myQueueDocRef);
                if (myDoc.exists()) {
                     // This can happen in a race condition. Let's just wait.
                     return;
                }

                await addDoc(collection(firestore, 'matchmakingQueue'), {
                    playerId: user.uid,
                    timestamp: serverTimestamp(),
                });

                // Wait for 5 seconds to see if someone joins
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const myQueueSnapshot = await getDocs(query(queueRef, where("playerId", "==", user.uid)));
                
                if (myQueueSnapshot.empty) {
                    // I was matched by someone else while waiting
                    setIsMatchmaking(false);
                    return;
                }

                // Still in queue, so remove myself and create bot match
                myQueueSnapshot.forEach(doc => deleteDoc(doc.ref));

                const botPlayerId = 'checkers_bot';
                const portraitImages = ['/portraits/Joe.png', '/portraits/James.png', '/portraits/Jena.png', '/portraits/Jonny.png', '/portraits/Jigg.png'];
                const randomAvatar = portraitImages[Math.floor(Math.random() * portraitImages.length)];
                
                 const gameSession = {
                    player1Id: user.uid,
                    player2Id: botPlayerId,
                    status: 'ready',
                    turn: user.uid,
                    createdAt: serverTimestamp(),
                    board: generateInitialBoard(),
                    members: { [user.uid]: true },
                    presentPlayers: { [user.uid]: true, [botPlayerId]: true },
                    botPlayer: {
                        id: botPlayerId,
                        displayName: 'CheckersBot',
                        avatarUrl: randomAvatar,
                        playerKey: 'p2'
                    }
                };
                const docRef = await addDoc(collection(firestore, 'game_sessions'), gameSession);
                toast({ title: "Oponente é um Bot!", description: "Ninguém foi encontrado. Jogando contra um bot." });
                router.push(`/game/${docRef.id}`);
            }
        } catch (error) {
            console.error("Matchmaking error: ", error);
            toast({ title: "Erro no Matchmaking", description: "Não foi possível encontrar uma partida.", variant: 'destructive' });
            setIsMatchmaking(false);
        }
    }


    const isRankedUnlocked = (userProfile?.level || 0) >= 10;
    
    if (isMatchmaking) {
        return (
             <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoadingAnimation />
                <p className="text-muted-foreground">Procurando por um oponente...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <GameInvites />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Partida</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                     <Button 
                        className="w-full h-16 text-lg" 
                        size="lg" 
                        variant="outline" 
                        disabled={!isRankedUnlocked}
                        title={!isRankedUnlocked ? "Disponível no nível 10" : "Jogar partida ranqueada"}
                     >
                        <Trophy className="mr-2 h-6 w-6" />
                        Ranqueada
                    </Button>
                    <Button className="w-full h-16 text-lg" size="lg" variant="outline" onClick={handleCasualMatchmaking}>
                        <Swords className="mr-2 h-6 w-6" />
                        Casual
                    </Button>
                     <Button className="w-full h-16 text-lg" size="lg" onClick={onFriendMatchClick}>
                        <Users className="mr-2 h-6 w-6" />
                        Com Amigo
                    </Button>
                </CardContent>
            </Card>

            <div className="w-full max-w-md mt-8">
                <RecentGames />
            </div>
        </div>
    )
}
