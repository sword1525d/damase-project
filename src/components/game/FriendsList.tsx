import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Gamepad2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const friends = [
  { id: 'friend-1', name: 'CheckmateCharlie', online: true, imageId: "friend-1" },
  { id: 'friend-2', name: 'RookRiot', online: false, imageId: "friend-2" },
  { id: 'friend-3', name: 'QueenOfChaos', online: true, imageId: "friend-3" },
  { id: 'friend-4', name: 'PawnStorm', online: true, imageId: "friend-4" },
  { id: 'friend-5', name: 'KnightRider', online: false, imageUrlSeed: 16 },
  { id: 'friend-6', name: 'BishopBlitz', online: true, imageUrlSeed: 17 },
  { id: 'friend-7', name: 'KingSlayer', online: true, imageUrlSeed: 18 },
  { id: 'friend-8', name: 'GrandmasterGus', online: false, imageUrlSeed: 19 },
];

export function FriendsList() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Friends</h2>
        <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search friends..." className="pl-8 bg-background" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 md:p-4 space-y-1">
          {friends.map(friend => {
            const avatarData = PlaceHolderImages.find(p => p.id === friend.imageId);
            const avatar = avatarData || { 
              imageUrl: `https://picsum.photos/seed/${friend.imageUrlSeed}/40/40`,
              imageHint: 'avatar person'
            };
            
            return (
              <div key={friend.id} className="flex items-center justify-between group p-2 rounded-md hover:bg-secondary">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatar.imageUrl} alt={friend.name} data-ai-hint={avatar.imageHint} />
                      <AvatarFallback>{friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card",
                      friend.online ? 'bg-green-500' : 'bg-gray-500'
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">{friend.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                {friend.online && (
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
