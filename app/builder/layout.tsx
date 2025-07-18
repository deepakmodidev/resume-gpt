import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { ThemeProvider } from '@/components/ui/theme-provider';

export default async function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect('/');
  }

  return (
    <main suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </main>
  );
}
