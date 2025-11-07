"use client";

import { FriendsList } from "@/components/game/FriendsList";
import { GameArea } from "@/components/game/GameArea";
import { Chat } from "@/components/game/Chat";
import { MobileNav } from "@/components/game/MobileNav";
import { useUser } from "@/firebase";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GamePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Crown className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  return (
     <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Button asChild variant="ghost" size="icon" className="lg:hidden">
            <Link href="/dashboard">
                <ArrowLeft />
                <span className="sr-only">Back to Lobby</span>
            </Link>
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Crown className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block text-lg">CheckersVerse</span>
        </Link>
      </header>
        <div className="grid h-[calc(100vh-4rem)] grid-cols-1 xl:grid-cols-[3fr_1fr]">
            <section className="flex flex-col overflow-auto relative">
                <GameArea gameId={gameId} />
            </section>
            <aside className="hidden xl:block border-l">
                <Chat gameSessionId={gameId} />
            </aside>
        </div>
    </div>
  );
}
