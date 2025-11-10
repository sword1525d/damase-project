import { LoginForm } from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <LoginForm />
      </main>
      <footer className="py-4 px-8 text-center text-xs text-muted-foreground">
        by LUCAS LIMA
      </footer>
    </div>
  );
}
