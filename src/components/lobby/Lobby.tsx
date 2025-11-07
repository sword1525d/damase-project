'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";

export function Lobby() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Game Lobby</CardTitle>
                    <CardDescription>Choose how you want to play.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full h-16 text-lg" size="lg">
                        <Swords className="mr-2 h-6 w-6" />
                        Find Random Match
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">Or invite a friend from the list on the left.</p>
                </CardContent>
            </Card>
        </div>
    )
}
