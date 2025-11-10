'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameInvites } from "@/components/lobby/GameInvites";
import { Swords, Users, Trophy } from "lucide-react";
import { RecentGames } from "./RecentGames";

export function Lobby({ onFriendMatchClick }: { onFriendMatchClick?: () => void }) {
    
    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <GameInvites />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Partida</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                     <Button className="w-full h-16 text-lg" size="lg" variant="outline" disabled>
                        <Trophy className="mr-2 h-6 w-6" />
                        Ranqueada
                    </Button>
                    <Button className="w-full h-16 text-lg" size="lg" variant="outline">
                        <Swords className="mr-2 h-6 w-6" />
                        Casual
                    </Button>
                     <Button className="w-full h-16 text-lg" size="lg" onClick={onFriendMatchClick}>
                        <Users className="mr-2 h-6 w-6" />
                        Com Amigo
                    </Button>
                </CardContent>
            </Card>

            <div className="w-full max-w-md mt-8">
                <RecentGames />
            </div>
        </div>
    )
}
