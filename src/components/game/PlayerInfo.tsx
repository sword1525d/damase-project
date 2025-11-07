import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Crown } from "lucide-react";

export function PlayerInfo() {
  const playerAvatar = PlaceHolderImages.find(p => p.id === 'player-avatar');
  const opponentAvatar = PlaceHolderImages.find(p => p.id === 'opponent-avatar');

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <div className="flex justify-between items-center p-4 bg-card rounded-lg shadow-md">
        {/* Opponent Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-12 h-12 md:w-16 md:h-16 border-2 border-muted">
              {opponentAvatar && <AvatarImage src={opponentAvatar.imageUrl} alt="Opponent Avatar" data-ai-hint={opponentAvatar.imageHint} />}
              <AvatarFallback>OP</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h3 className="font-semibold text-md md:text-lg">Opponent</h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>Pieces: 12</span>
                <span className="flex items-center gap-1"><Crown className="w-4 h-4" /> 0</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
            <h2 className="text-xl font-bold text-accent-foreground">VS</h2>
        </div>

        {/* Player Info */}
        <div className="flex items-center flex-row-reverse text-right gap-4">
          <div className="relative">
            <Avatar className="w-12 h-12 md:w-16 md:h-16 border-2 border-primary">
              {playerAvatar && <AvatarImage src={playerAvatar.imageUrl} alt="Player Avatar" data-ai-hint={playerAvatar.imageHint} />}
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-background px-1.5 py-0.5 rounded-full text-xs font-semibold border border-primary text-primary">
                Your Turn
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-md md:text-lg">You</h3>
            <div className="flex items-center justify-end gap-2 text-muted-foreground text-sm">
                <span>Pieces: 12</span>
                <span className="flex items-center gap-1"><Crown className="w-4 h-4" /> 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
