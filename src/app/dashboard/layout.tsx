import type { Metadata } from "next";
import Link from 'next/link';
import { Crown } from "lucide-react";
import { UserDropdown } from "@/components/auth/UserDropdown";


export const metadata: Metadata = {
  title: "Dashboard | Dama-se",
  description: "Seu dashboard no Dama-se.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Crown className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline-block text-lg">Dama-se</span>
        </Link>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial" />
          <UserDropdown />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
