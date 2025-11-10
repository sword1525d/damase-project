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
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div>
      <div className="grid lg:grid-cols-[1fr_3fr]">
        <aside className="hidden lg:block border-r">
          <FriendsList />
        </aside>

        <section className="flex flex-col relative p-4 md:px-8 md:pt-12 md:pb-8 justify-center min-h-[calc(100vh-8rem)]">
          <MobileNav isFriendsSheetOpen={isFriendsSheetOpen} onFriendsSheetChange={setIsFriendsSheetOpen} />
          <Lobby onFriendMatchClick={() => setIsFriendsSheetOpen(true)} />
        </section>
      </div>
    </div>
  );
}
