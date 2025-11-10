
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Badge } from "../ui/badge";

export function UserDropdown() {
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}/profile`, "main");
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userProfileRef);

  const handleLogout = () => {
    auth.signOut();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.displayName || "Usuário"} />
            <AvatarFallback>{userProfile?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
           {userProfile?.level && (
            <Badge variant="default" className="absolute -bottom-1 -right-1 h-5 w-5 p-0 justify-center text-xs rounded-full border-2 border-background">
              {userProfile.level}
            </Badge>
          )}
          <span className="sr-only">Abrir menu do usuário</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
