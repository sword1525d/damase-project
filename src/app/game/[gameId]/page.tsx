"use client";

import { Chat } from "@/components/game/Chat";
import { GameArea } from "@/components/game/GameArea";
import { MobileNav } from "@/components/game/MobileNav";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";
import { ArrowLeft } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingAnimation } from "@/components/game/LoadingAnimation";

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
        <LoadingAnimation />
      </div>
    );
  }

  return (
     <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-40 flex h-16 items-center gap-4 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Button asChild variant="ghost" size="icon" className="lg:hidden">
            <Link href="/dashboard">
                <ArrowLeft />
                <span className="sr-only">Voltar para o Painel</span>
            </Link>
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="/icon.svg" alt="Dama-se logo" width={24} height={24} className="h-6 w-6" />
          <span className="text-lg whitespace-nowrap">Dama-se</span>
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
