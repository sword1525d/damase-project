
'use client';
import { useCollection, useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import { collection, query, where, serverTimestamp } from 'firebase/firestore';
import { UserProfileBadge } from './UserProfileBadge';
import { Gamepad2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

export function OnlineFriends() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const friendsQuery1 = useMemoFirebase(() => {
        if(!user) return null;
        return query(
            collection(firestore, 'friendships'),
            where('user1Id', '==', user.uid),
            where('status', '==', 'accepted')
        );
    }, [firestore, user]);

    const friendsQuery2 = useMemoFirebase(() => {
        if(!user) return null;
        return query(
            collection(firestore, 'friendships'),
            where('user2Id', '==', user.uid),
            where('status', '==', 'accepted')
        );
    }, [firestore, user]);

    const { data: friendships1, isLoading: isLoading1 } = useCollection(friendsQuery1);
    const { data: friendships2, isLoading: isLoading2 } = useCollection(friendsQuery2);

    const friendIds = useMemo(() => {
        if (!friendships1 || !friendships2) return [];
        const ids1 = friendships1.map(f => f.user2Id);
        const ids2 = friendships2.map(f => f.user1Id);
        return [...new Set([...ids1, ...ids2])];
    }, [friendships1, friendships2]);

    const isLoading = isLoading1 || isLoading2;

    const handleInvite = async (friendId: string) => {
        if (!user) return;

        const gameSession = {
            player1Id: user.uid,
            player2Id: friendId,
            status: 'pending_invite',
            turn: user.uid,
            createdAt: serverTimestamp(),
            board: [
                [null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }],
                [{ player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null],
                [null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }],
                [null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null],
                [{ player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null],
                [null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }],
                [{ player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null],
            ],
            members: {
                [user.uid]: true,
                [friendId]: true,
            }
        };

        try {
            const docRef = await addDocumentNonBlocking(collection(firestore, 'game_sessions'), gameSession);
            toast({
                title: "Convite Enviado!",
                description: "Seu amigo foi convidado para a partida.",
            })
            router.push(`/game/${docRef.id}`);
        } catch (error) {
            console.error("Error creating game session: ", error);
            toast({
                title: "Erro",
                description: "Não foi possível criar a partida.",
                variant: "destructive"
            })
        }
    }

    return (
         <div className="p-2 md:p-4 space-y-1">
            <h3 className='text-sm font-semibold text-muted-foreground px-2 mb-2'>Friends</h3>
            {isLoading && <p className='text-xs text-muted-foreground px-2'>Loading friends...</p>}
            {friendIds && friendIds.length === 0 && !isLoading && <p className='text-xs text-muted-foreground px-2'>No friends yet. Add some!</p>}
            {friendIds?.map(friendId => (
                <div key={friendId} className="flex items-center justify-between group p-2 rounded-md hover:bg-secondary">
                    <UserProfileBadge userId={friendId} showOnlineStatus={true} />
                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleInvite(friendId)}>
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Invite
                    </Button>
                </div>
            ))}
        </div>
    )
}
