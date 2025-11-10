'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameInvites } from "@/components/lobby/GameInvites";
import { Swords } from "lucide-react";
import { RecentGames } from "./RecentGames";

export function Lobby() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 relative">
            <GameInvites />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Partida</CardTitle>
                    <CardDescription>Escolha como você quer jogar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full h-16 text-lg" size="lg">
                        <Swords className="mr-2 h-6 w-6" />
                        Partida Aleatória
                    </Button>
                </CardContent>
            </Card>

            <div className="w-full max-w-md mt-8">
                <RecentGames />
            </div>
        </div>
    )
}
