import { PlayerInfo } from "./PlayerInfo";
import { CheckersBoard } from "./CheckersBoard";

export function GameArea() {
  return (
    <div className="flex-1 flex flex-col p-4 pt-20 md:p-6 lg:p-8 lg:pt-8 items-center justify-center">
      <PlayerInfo />
      <CheckersBoard />
    </div>
  );
}
