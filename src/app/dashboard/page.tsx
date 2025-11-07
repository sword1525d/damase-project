import { FriendsList } from "@/components/game/FriendsList";
import { GameArea } from "@/components/game/GameArea";
import { Chat } from "@/components/game/Chat";
import { MobileNav } from "@/components/game/MobileNav";

export default function DashboardPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_350px]">
        {/* Friends List (Left Sidebar) */}
        <aside className="hidden lg:flex flex-col border-r bg-card/50">
          <FriendsList />
        </aside>

        {/* Game Area (Center) */}
        <section className="flex flex-col overflow-auto relative">
          <MobileNav />
          <GameArea />
        </section>

        {/* Chat (Right Sidebar) */}
        <aside className="hidden xl:flex flex-col border-l bg-card/50">
          <Chat />
        </aside>
      </div>
    </div>
  );
}
