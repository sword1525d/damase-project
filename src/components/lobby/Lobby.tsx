'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameInvites } from "@/components/lobby/GameInvites";
import { Swords, Users } from "lucide-react";
import { RecentGames } from "./RecentGames";
import { useToast } from "@/hooks/use-toast";

export function Lobby() {
    const { toast } = useToast();

    const handleFriendMatchClick = () => {
        toast({
            title: "Convide um Amigo",
            description: "Para jogar com um amigo, convide-o diretamente pela lista de amigos à esquerda.",
        });
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 relative">
            <GameInvites />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Partida</CardTitle>
                    <CardDescription>Escolha como você quer jogar.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="w-full h-16 text-lg" size="lg" variant="outline">
                        <Swords className="mr-2 h-6 w-6" />
                        Casual
                    </Button>
                     <Button className="w-full h-16 text-lg" size="lg" onClick={handleFriendMatchClick}>
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
