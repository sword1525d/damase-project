"use client"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { FriendsList } from "./FriendsList";
import { Chat } from "./Chat";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePathname } from "next/navigation";


export function MobileNav() {
    const pathname = usePathname();
    const isGamePage = pathname.includes('/game/');

    return (
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                        <Users className="w-4 h-4 mr-2" />
                        Amigos
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 pt-10 w-[300px] bg-card/95 backdrop-blur-sm border-r">
                    <VisuallyHidden>
                      <SheetTitle>Painel de Amigos</SheetTitle>
                      <SheetDescription>Veja sua lista de amigos, pedidos pendentes e adicione novos amigos.</SheetDescription>
                    </VisuallyHidden>
                    <FriendsList />
                </SheetContent>
            </Sheet>
            
            {isGamePage && (
                <div className="xl:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                             <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Chat
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 pt-10 w-[320px] bg-card/95 backdrop-blur-sm border-l">
                             <VisuallyHidden>
                              <SheetTitle>Chat da Partida</SheetTitle>
                              <SheetDescription>Converse com seu oponente durante o jogo.</SheetDescription>
                            </VisuallyHidden>
                            <Chat gameSessionId={null} />
                        </SheetContent>
                    </Sheet>
                </div>
            )}
        </div>
    )
}
