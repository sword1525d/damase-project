import type { Metadata } from "next";
import Link from 'next/link';
import Image from 'next/image';
import { UserDropdown } from "@/components/auth/UserDropdown";


export const metadata: Metadata = {
  title: "Painel | Dama-se",
  description: "Seu painel no Dama-se.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="/icon.svg" alt="Dama-se logo" width={24} height={24} className="h-6 w-6" />
          <span className="text-lg whitespace-nowrap">Dama-se</span>
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
