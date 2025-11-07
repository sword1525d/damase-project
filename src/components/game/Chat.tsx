"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Send, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Message = {
    id: number;
    user: 'You' | 'Opponent';
    avatarId: 'player-avatar' | 'opponent-avatar';
    text: string;
};

const initialMessages: Message[] = [
    { id: 1, user: 'Opponent', avatarId: 'opponent-avatar', text: 'Good luck!' },
    { id: 2, user: 'You', avatarId: 'player-avatar', text: 'Thanks, you too!' },
    { id: 3, user: 'Opponent', avatarId: 'opponent-avatar', text: 'Nice move.' },
];


export function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const playerAvatar = PlaceHolderImages.find(p => p.id === 'player-avatar');
  const opponentAvatar = PlaceHolderImages.find(p => p.id === 'opponent-avatar');

  const avatars = {
    'player-avatar': playerAvatar,
    'opponent-avatar': opponentAvatar,
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(newMessage.trim()){
        setMessages([...messages, {
            id: Date.now(),
            user: 'You',
            avatarId: 'player-avatar',
            text: newMessage.trim()
        }]);
        setNewMessage('');
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Game Chat</h2>
      </div>
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-4">
            {messages.map(msg => (
                 <div key={msg.id} className={`flex items-start gap-3 ${msg.user === 'You' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={avatars[msg.avatarId]?.imageUrl} alt={msg.user} data-ai-hint={avatars[msg.avatarId]?.imageHint} />
                        <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`p-3 rounded-lg max-w-[75%] shadow-sm ${msg.user === 'You' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
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
