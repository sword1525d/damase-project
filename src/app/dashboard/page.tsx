import { FriendsList } from "@/components/game/FriendsList";
import { GameArea } from "@/components/game/GameArea";
import { Chat } from "@/components/game/Chat";
import { MobileNav } from "@/components/game/MobileNav";

export default function DashboardPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid h-full grid-cols-1">
        {/* Friends List (Left Sidebar) - Hidden on desktop, available on mobile */}
        <aside className="hidden">
          <FriendsList />
        </aside>

        {/* Game Area (Center) */}
        <section className="flex flex-col overflow-auto relative">
          <MobileNav />
          <GameArea />
        </section>

        {/* Chat (Right Sidebar) - Hidden on desktop, available on mobile */}
        <aside className="hidden">
          <Chat />
        </aside>
      </div>
    </div>
  );
}
