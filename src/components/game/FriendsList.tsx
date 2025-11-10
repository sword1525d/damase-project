import { AddFriendDialog } from "@/components/friends/AddFriendDialog";
import { FriendRequests } from "@/components/friends/FriendRequests";
import { OnlineFriends } from "@/components/friends/OnlineFriends";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FriendsList() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Friends</h2>
          <AddFriendDialog />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <FriendRequests />
        <OnlineFriends />
      </ScrollArea>
    </div>
  );
}
