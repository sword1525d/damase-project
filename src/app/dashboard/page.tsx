"use client";

import { FriendsList } from "@/components/game/FriendsList";
import { GameArea } from "@/components/game/GameArea";
import { Chat } from "@/components/game/Chat";
import { MobileNav } from "@/components/game/MobileNav";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Crown } from "lucide-react";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Crown className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_3fr] xl:grid-cols-[1fr_3fr_1fr]">
        <aside className="hidden lg:block border-r">
          <FriendsList />
        </aside>

        <section className="flex flex-col overflow-auto relative">
          <MobileNav />
          <GameArea />
        </section>

        <aside className="hidden xl:block border-l">
          <Chat />
        </aside>
      </div>
    </div>
  );
}
