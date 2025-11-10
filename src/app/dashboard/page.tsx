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
    <div className="h-full">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_3fr]">
        <aside className="hidden lg:block border-r">
          <FriendsList />
        </aside>

        <section className="flex flex-col overflow-auto relative">
          <MobileNav isFriendsSheetOpen={isFriendsSheetOpen} onFriendsSheetChange={setIsFriendsSheetOpen} />
          <Lobby onFriendMatchClick={() => setIsFriendsSheetOpen(true)} />
        </section>
      </div>
    </div>
  );
}
