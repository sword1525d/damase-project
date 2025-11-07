
'use client';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { UserProfileBadge } from './UserProfileBadge';
import { Gamepad2 } from 'lucide-react';
import { Button } from '../ui/button';

export function OnlineFriends() {
    const firestore = useFirestore();
    const { user } = useUser();

    const friendsQuery = useMemoFirebase(() => {
        if(!user) return null;
        return query(
            collection(firestore, 'friendships'),
            where('members', 'array-contains', user.uid),
            where('status', '==', 'accepted')
        );
    }, [firestore, user]);

    const { data: friendships, isLoading } = useCollection(friendsQuery);

    const friendIds = friendships?.map(f => f.user1Id === user?.uid ? f.user2Id : f.user1Id);

    return (
         <div className="p-2 md:p-4 space-y-1">
            <h3 className='text-sm font-semibold text-muted-foreground px-2 mb-2'>Friends</h3>
            {isLoading && <p className='text-xs text-muted-foreground px-2'>Loading friends...</p>}
            {friendIds && friendIds.length === 0 && !isLoading && <p className='text-xs text-muted-foreground px-2'>No friends yet. Add some!</p>}
            {friendIds?.map(friendId => (
                <div key={friendId} className="flex items-center justify-between group p-2 rounded-md hover:bg-secondary">
                    <UserProfileBadge userId={friendId} showOnlineStatus={true} />
                    <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Invite
                    </Button>
                </div>
            ))}
        </div>
    )
}
