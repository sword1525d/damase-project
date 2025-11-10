"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollection, useFirestore, useUser, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Send, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Chat({ gameSessionId }: { gameSessionId: string | null }) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  const messagesCollectionRef = useMemoFirebase(() => {
    if (!gameSessionId) return null;
    return collection(firestore, `game_sessions/${gameSessionId}/messages`);
  }, [firestore, gameSessionId]);
  
  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollectionRef) return null;
    return query(messagesCollectionRef, orderBy("timestamp", "asc"));
  }, [messagesCollectionRef]);

  const { data: messages } = useCollection(messagesQuery);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(newMessage.trim() && user && messagesCollectionRef){
        addDocumentNonBlocking(messagesCollectionRef, {
            senderId: user.uid,
            content: newMessage.trim(),
            timestamp: new Date(),
        });
        setNewMessage('');
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  if (!gameSessionId) {
    return (
         <div className="flex flex-col h-full items-center justify-center bg-card text-card-foreground">
            <p className="text-muted-foreground">Select a game to see the chat.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Game Chat</h2>
      </div>
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-4">
            {messages?.map(msg => (
                 <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={"https://picsum.photos/seed/1/40/40"} alt={msg.senderId} data-ai-hint={"avatar"} />
                        <AvatarFallback>{/* Can be improved */}</AvatarFallback>
                    </Avatar>
                    <div className={`p-3 rounded-lg max-w-[75%] shadow-sm ${msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        <p className="text-sm">{msg.content}</p>
                    </div>
                </div>
            ))}
        </div>
      </ScrollArea>
      <div className="p-4 mt-auto">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                className="pr-10 bg-background" />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                <Smile className="w-4 h-4 text-muted-foreground" />
                <span className="sr-only">Add emoji</span>
            </Button>
          </div>
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
