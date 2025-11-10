
'use client';
import { useCollection, useFirestore, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';
import { UserProfileBadge } from './UserProfileBadge';
import { useMemoFirebase } from '@/firebase/provider';


export function FriendRequests() {
    const firestore = useFirestore();
    const { user } = useUser();

    const friendRequestsQuery = useMemoFirebase(() => {
        if(!user) return null;
        return query(
            collection(firestore, 'friendships'),
            where('user2Id', '==', user.uid),
            where('status', '==', 'pending')
        );
    }, [firestore, user]);
    
    const { data: requests, isLoading } = useCollection(friendRequestsQuery);

    const handleAccept = (requestId: string) => {
        const requestDocRef = doc(firestore, 'friendships', requestId);
        updateDocumentNonBlocking(requestDocRef, { status: 'accepted' });
    }

    const handleDecline = (requestId: string) => {
        const requestDocRef = doc(firestore, 'friendships', requestId);
        deleteDocumentNonBlocking(requestDocRef);
    }
    
    if (isLoading || !requests || requests.length === 0) {
        return null;
    }

    return (
        <div className="p-2 md:p-4 space-y-2">
            <h3 className='text-sm font-semibold text-muted-foreground px-2'>Pedidos de Amizade</h3>
            {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between group p-2 rounded-md hover:bg-secondary">
                    <UserProfileBadge userId={req.user1Id} />
                    <div className='flex gap-1'>
                        <Button size="icon" variant="ghost" className='h-8 w-8' onClick={() => handleAccept(req.id)}>
                            <Check className="w-4 h-4 text-green-500" />
                        </Button>
                         <Button size="icon" variant="ghost" className='h-8 w-8' onClick={() => handleDecline(req.id)}>
                            <X className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
