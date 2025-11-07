"use client"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { FriendsList } from "./FriendsList";
import { Chat } from "./Chat";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


export function MobileNav() {
    return (
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                        <Users className="w-4 h-4 mr-2" />
                        Friends
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px] bg-card/95 backdrop-blur-sm border-r">
                    <VisuallyHidden>
                      <SheetTitle>Friends Panel</SheetTitle>
                      <SheetDescription>View your friends list, pending requests, and add new friends.</SheetDescription>
                    </VisuallyHidden>
                    <FriendsList />
                </SheetContent>
            </Sheet>
            
            <div className="xl:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 w-[320px] bg-card/95 backdrop-blur-sm border-l">
                         <VisuallyHidden>
                          <SheetTitle>Game Chat</SheetTitle>
                          <SheetDescription>Chat with your opponent during the game.</SheetDescription>
                        </VisuallyHidden>
                        <Chat />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}
