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
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { initiateEmailSignUp } from "@/firebase/non-blocking-login";
import React, { useEffect, useState } from "react";
import { doc } from "firebase/firestore";

export function RegisterForm() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isUserLoading && user) {
      const userDocRef = doc(firestore, `users/${user.uid}`);
      setDocumentNonBlocking(userDocRef, {
        id: user.uid,
        username: username || user.displayName || user.email,
        email: user.email,
        registrationDate: user.metadata.creationTime || new Date().toISOString(),
      }, { merge: true });

      const userProfileDocRef = doc(firestore, `users/${user.uid}/profile`, "main");
        setDocumentNonBlocking(userProfileDocRef, {
            id: 'main',
            displayName: username || user.displayName || user.email,
            avatarUrl: user.photoURL,
        }, { merge: true });


      router.push("/dashboard");
    }
  }, [user, isUserLoading, router, firestore, username]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignUp(auth, email, password);
  };

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
            <CardTitle className="text-3xl font-bold">CheckersVerse</CardTitle>
        </div>
        <CardDescription>Create your account to start playing.</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="CheckersKing123" required value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="player@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Create Account</Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="underline text-accent-foreground hover:text-accent/90">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
