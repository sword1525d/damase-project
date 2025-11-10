'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LoadingAnimation } from "@/components/game/LoadingAnimation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { collection, query, where, doc } from 'firebase/firestore';
import { Crown, Swords, Handshake, CalendarDays, Trophy, BarChart3, Mail, Pencil } from "lucide-react";
import { RecentGames } from "@/components/lobby/RecentGames";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: number | string }) {
    return (
        <Card className="flex-1 text-center bg-secondary/50">
            <CardHeader className="p-4">
                <div className="flex justify-center mb-2">{icon}</div>
                <CardTitle className="text-2xl font-bold">{value}</CardTitle>
                <CardDescription className="text-xs">{title}</CardDescription>
            </CardHeader>
        </Card>
    );
}

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push("/");
        }
    }, [user, isUserLoading, router]);

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}/profile`, "main");
    }, [firestore, user]);

    const userAccountRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [firestore, user]);

    const { data: userProfile } = useDoc(userProfileRef);
    const { data: userAccount } = useDoc(userAccountRef);

    useEffect(() => {
        if (userProfile) {
            setNewDisplayName(userProfile.displayName);
        }
    }, [userProfile]);

    const gamesAsPlayer1Query = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'game_sessions'), where('player1Id', '==', user.uid), where('status', '==', 'completed'));
    }, [firestore, user]);

    const gamesAsPlayer2Query = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'game_sessions'), where('player2Id', '==', user.uid), where('status', '==', 'completed'));
    }, [firestore, user]);

    const { data: gamesAsPlayer1, isLoading: isLoading1 } = useCollection(gamesAsPlayer1Query);
    const { data: gamesAsPlayer2, isLoading: isLoading2 } = useCollection(gamesAsPlayer2Query);

    const stats = useMemo(() => {
        const allGames = [...(gamesAsPlayer1 || []), ...(gamesAsPlayer2 || [])];
        const uniqueGames = Array.from(new Map(allGames.map(game => [game.id, game])).values());

        const wins = uniqueGames.filter(game => game.winnerId === user?.uid).length;
        const losses = uniqueGames.filter(game => game.winnerId && game.winnerId !== user?.uid).length;
        const draws = uniqueGames.filter(game => game.winnerId === null).length;
        const total = uniqueGames.length;

        return { wins, losses, draws, total };
    }, [gamesAsPlayer1, gamesAsPlayer2, user]);

    const handleSave = () => {
        if (newDisplayName.trim() && userProfileRef) {
            updateDocumentNonBlocking(userProfileRef, { displayName: newDisplayName.trim() });
            setIsModalOpen(false);
        }
    }

    if (isUserLoading || !user || !userProfile || !userAccount) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <LoadingAnimation />
            </div>
        );
    }

    const registrationDate = userAccount.registrationDate ? new Date(userAccount.registrationDate).toLocaleDateString('pt-BR') : 'N/A';

    return (
        <div className="flex flex-col items-center p-4 md:p-8 bg-background min-h-screen text-foreground">
             <div className="w-full max-w-4xl">
                 <Button asChild variant="link" className="mb-4">
                    <Link href="/dashboard">
                        &larr; Voltar para o Lobby
                    </Link>
                </Button>
                <Card className="w-full border-2 border-border shadow-2xl">
                    <CardHeader className="text-center items-center space-y-4 p-6">
                        <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.displayName} data-ai-hint="avatar" />
                            <AvatarFallback>{userProfile.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                             <div className="flex items-center gap-2 justify-center">
                                <CardTitle className="text-3xl font-bold">{userProfile.displayName}</CardTitle>
                                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                            <Pencil className="w-5 h-5" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                        <DialogTitle>Editar nome de exibição</DialogTitle>
                                        <DialogDescription>
                                            Faça alterações no seu nome de exibição aqui. Clique em salvar quando terminar.
                                        </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Nome
                                                </Label>
                                                <Input 
                                                    id="name" 
                                                    value={newDisplayName}
                                                    onChange={(e) => setNewDisplayName(e.target.value)}
                                                    className="col-span-3"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="secondary">
                                                    Cancelar
                                                </Button>
                                            </DialogClose>
                                            <Button type="button" onClick={handleSave}>Salvar alterações</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <CardDescription className="text-muted-foreground">ID: #{userAccount.numericId}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8 px-4 md:px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                             <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <span>{userAccount.email}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-card p-3 rounded-lg">
                                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                                <span>Membro desde: {registrationDate}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Estatísticas</h3>
                             <div className="flex flex-wrap gap-4">
                                <StatCard icon={<Trophy className="w-6 h-6 text-green-400" />} title="Vitórias" value={stats.wins} />
                                <StatCard icon={<Swords className="w-6 h-6 text-red-400" />} title="Derrotas" value={stats.losses} />
                                <StatCard icon={<Handshake className="w-6 h-6 text-amber-400" />} title="Empates" value={stats.draws} />
                                <StatCard icon={<Crown className="w-6 h-6 text-blue-400" />} title="Total de Partidas" value={stats.total} />
                            </div>
                        </div>
                        
                        <div className="w-full">
                            <RecentGames />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
