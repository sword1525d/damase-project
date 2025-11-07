
'use client';
import { useDatabase, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";

interface UserProfileBadgeProps {
    userId: string;
    showOnlineStatus?: boolean;
}

export function UserProfileBadge({ userId, showOnlineStatus = false }: UserProfileBadgeProps) {
    const firestore = useFirestore();
    const database = useDatabase();
    const [isOnline, setIsOnline] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!userId) return null;
        return doc(firestore, `users/${userId}/profile`, 'main');
    }, [firestore, userId]);
    const { data: userProfile } = useDoc(userProfileRef);

    useEffect(() => {
        if (!showOnlineStatus || !database || !userId) return;

        const userStatusRef = ref(database, 'status/' + userId);
        const unsubscribe = onValue(userStatusRef, (snapshot) => {
            const status = snapshot.val();
            setIsOnline(status?.state === 'online');
        });

        return () => unsubscribe();
    }, [database, userId, showOnlineStatus]);

    if (!userProfile) {
        return <div className="h-10 w-full animate-pulse bg-secondary rounded-md" />;
    }

    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.displayName} data-ai-hint={'avatar'} />
                    <AvatarFallback>{userProfile.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {showOnlineStatus && (
                    <span className={cn(
                    "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card",
                    isOnline ? 'bg-green-500' : 'bg-gray-500'
                    )} />
                )}
            </div>
            <div>
                <p className="font-medium text-sm">{userProfile.displayName}</p>
                {showOnlineStatus && (
                     <p className="text-xs text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</p>
                )}
            </div>
        </div>
    );
}

