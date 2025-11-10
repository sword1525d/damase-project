
'use client';

import { useCollection, useFirestore, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import { collection, query, where, doc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserProfileBadge } from '../friends/UserProfileBadge';

export function GameInvites() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [openInvite, setOpenInvite] = useState<any>(null);


  const gameInvitesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'game_sessions'),
      where('player2Id', '==', user.uid),
      where('status', '==', 'pending_invite')
    );
  }, [firestore, user]);

  const { data: invites, isLoading } = useCollection(gameInvitesQuery);

  useEffect(() => {
    if (invites && invites.length > 0 && !openInvite) {
        setOpenInvite(invites[0]);
    }
  }, [invites, openInvite]);


  const handleAccept = () => {
    if (!openInvite) return;
    const gameDocRef = doc(firestore, 'game_sessions', openInvite.id);
    updateDocumentNonBlocking(gameDocRef, { status: 'active' });
    router.push(`/game/${openInvite.id}`);
  };

  const handleDecline = () => {
    if (!openInvite) return;
    const gameDocRef = doc(firestore, 'game_sessions', openInvite.id);
    deleteDocumentNonBlocking(gameDocRef);
    setOpenInvite(null);
  };

  if (isLoading || !openInvite) {
    return null;
  }

  return (
    <AlertDialog open={!!openInvite} onOpenChange={() => setOpenInvite(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você foi desafiado!</AlertDialogTitle>
          <AlertDialogDescription>
            Você recebeu um convite para jogar Damas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
            <UserProfileBadge userId={openInvite.player1Id} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDecline}>Recusar</AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept}>Aceitar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
