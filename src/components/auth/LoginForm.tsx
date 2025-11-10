"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { initiateEmailSignIn, initiateGoogleSignIn } from "@/firebase/non-blocking-login";
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.02,35.636,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

  async function getNextNumericId(firestore: any) {
    const counterRef = doc(firestore, 'metadata', 'userCounter');
    let newId;
    
    await runTransaction(firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let lastId = 100000; // Start from 100001
        if (counterDoc.exists()) {
            lastId = counterDoc.data().lastId;
        }
        newId = lastId + 1;
        transaction.set(counterRef, { lastId: newId });
    });

    return newId?.toString().padStart(6, '0');
}


export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const setupUser = async () => {
        if (!isUserLoading && user && firestore) {
            const userDocRef = doc(firestore, `users/${user.uid}`);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const numericId = await getNextNumericId(firestore);
                // Create user document
                await setDoc(userDocRef, {
                    id: user.uid,
                    numericId: numericId,
                    username: user.displayName || user.email,
                    email: user.email,
                    registrationDate: user.metadata.creationTime || new Date().toISOString(),
                }, { merge: true });

                // Create user profile document
                const userProfileDocRef = doc(firestore, `users/${user.uid}/profile`, "main");
                await setDoc(userProfileDocRef, {
                    id: 'main',
                    displayName: user.displayName || user.email,
                    avatarUrl: user.photoURL
                }, { merge: true });
            }
            router.push("/dashboard");
        }
    };
    setupUser();
  }, [user, isUserLoading, router, firestore]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password);
  };
  
  const handleGoogleLogin = () => {
    initiateGoogleSignIn(auth);
  }

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Crown className="w-16 h-16 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-sm border-2 border-border shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-primary" />
          <CardTitle className="text-3xl font-bold">Dama-se</CardTitle>
        </div>
        <CardDescription>Bem-vindo de volta! Faça login para continuar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="player@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Entrar</Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex-col gap-4 items-center justify-center text-sm">
        <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/register" className="underline text-accent-foreground hover:text-accent/90">
                Cadastre-se
            </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
