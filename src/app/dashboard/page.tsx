"use client";

import { FriendsList } from "@/components/game/FriendsList";
import { MobileNav } from "@/components/game/MobileNav";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lobby } from "@/components/lobby/Lobby";
import { LoadingAnimation } from "@/components/game/LoadingAnimation";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isFriendsSheetOpen, setIsFriendsSheetOpen] = useState(false);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_3fr]">
        <aside className="hidden lg:block overflow-hidden">
          <FriendsList />
        </aside>

        <section className="flex flex-col h-full overflow-hidden">
          <MobileNav isFriendsSheetOpen={isFriendsSheetOpen} onFriendsSheetChange={setIsFriendsSheetOpen} />
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 md:px-8 md:pb-8 min-h-full flex items-center justify-center">
              <Lobby onFriendMatchClick={() => setIsFriendsSheetOpen(true)} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}