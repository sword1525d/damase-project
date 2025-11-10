'use client';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Crown, Swords, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

    const userProfileRef = useMemoFirebase(() => {
        if (!opponentId) return null;
        return doc(firestore, `users/${opponentId}/profile`, 'main');
    }, [firestore, opponentId]);

    const { data: opponentProfile } = useDoc(userProfileRef);

    if (!opponentProfile) {
        return <div className="h-10 w-24 animate-pulse bg-secondary rounded-md" />;
    }

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src={opponentProfile.avatarUrl} alt={opponentProfile.displayName} data-ai-hint="avatar" />
                <AvatarFallback>{opponentProfile.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-medium text-sm truncate">{opponentProfile.displayName}</p>
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

    const recentGamesQuery = useMemoFirebase(() => {
        if(!user) return null;
        return query(
            collection(firestore, 'game_sessions'),
            where('members.' + user.uid, '==', true),
            where('status', '==', 'completed'),
            orderBy('endTime', 'desc'),
            limit(5)
        );
    }, [firestore, user]);

    const { data: games, isLoading } = useCollection(recentGamesQuery);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Partidas Recentes</CardTitle>
                <CardDescription>Suas últimas 5 partidas concluídas.</CardDescription>
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
