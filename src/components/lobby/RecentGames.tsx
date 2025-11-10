
'use client';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Crown, Swords, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';

function GameResult({ game }: { game: any }) {
    const { user } = useUser();
    const isWinner = game.winnerId === user?.uid;
    const isDraw = game.winnerId === null;

    if (isDraw) {
        return <div className='flex items-center gap-2 text-sm text-amber-400'><Handshake className='h-4 w-4' /> Empate</div>;
    }

    if (isWinner) {
        return <div className='flex items-center gap-2 text-sm text-green-400'><Crown className='h-4 w-4' /> Vitória</div>;
    }

    return <div className='flex items-center gap-2 text-sm text-red-400'><Swords className='h-4 w-4' /> Derrota</div>;
}

function OpponentInfo({ game }: { game: any }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const opponentId = game.player1Id === user?.uid ? game.player2Id : game.player1Id;

    const isBotOpponent = opponentId === 'checkers_bot';
    const botProfile = game.botPlayer;

    const userProfileRef = useMemoFirebase(() => {
        if (!opponentId || isBotOpponent) return null;
        return doc(firestore, `users/${opponentId}/profile`, 'main');
    }, [firestore, opponentId, isBotOpponent]);

    const { data: opponentProfile, isLoading } = useDoc(userProfileRef);

    const profile = isBotOpponent ? botProfile : opponentProfile;

    if (isLoading) {
        return <div className="h-10 w-24 animate-pulse bg-secondary rounded-md" />;
    }

    if (!profile) {
        return <div className="flex items-center gap-3 text-sm text-muted-foreground">Oponente desconhecido</div>;
    }

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} data-ai-hint="avatar" />
                <AvatarFallback>{profile.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-medium text-sm truncate">{profile.displayName}</p>
                <p className='text-xs text-muted-foreground'>
                   {game.endTime ? formatDistanceToNow(new Date(game.endTime), { addSuffix: true, locale: ptBR }) : 'Agora'}
                </p>
            </div>
        </div>
    );
}


export function RecentGames() {
    const firestore = useFirestore();
    const { user } = useUser();

    // Query for games where user is player1 (sem orderBy para evitar índices compostos)
    const gamesAsPlayer1Query = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'game_sessions'),
            where('player1Id', '==', user.uid),
            where('status', '==', 'completed')
        );
    }, [firestore, user]);

    // Query for games where user is player2 (sem orderBy para evitar índices compostos)
    const gamesAsPlayer2Query = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'game_sessions'),
            where('player2Id', '==', user.uid),
            where('status', '==', 'completed')
        );
    }, [firestore, user]);

    const { data: games1, isLoading: isLoading1 } = useCollection(gamesAsPlayer1Query);
    const { data: games2, isLoading: isLoading2 } = useCollection(gamesAsPlayer2Query);

    // Combina, remove duplicatas, ordena e limita em memória
    const games = useMemo(() => {
        const allGames = [...(games1 || []), ...(games2 || [])];
        // Remove duplicates in case a user plays against themselves (unlikely but safe)
        const uniqueGames = Array.from(new Map(allGames.map(game => [game.id, game])).values());
        // Sort by endTime and take the latest 5
        return uniqueGames
            .filter(game => game.endTime) // Garante que endTime existe
            .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
            .slice(0, 5);
    }, [games1, games2]);

    const isLoading = isLoading1 || isLoading2;


    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Partidas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary animate-pulse h-16" />
                        ))}
                    </div>
                )}
                {!isLoading && (!games || games.length === 0) && (
                    <p className="text-sm text-center text-muted-foreground py-4">Nenhuma partida recente encontrada.</p>
                )}
                <div className='space-y-2'>
                    {games?.map(game => (
                        <div key={game.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                            <OpponentInfo game={game} />
                            <GameResult game={game} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
