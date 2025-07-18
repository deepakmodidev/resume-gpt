'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  NotepadTextDashed,
  User,
  LogOut,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { handleGoogleSignIn } from '@/actions/auth-actions';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignInClick = async () => {
    try {
      setIsSigningIn(true);
      await handleGoogleSignIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleNewResume = () => {
    const newChatId = uuidv4();
    router.push(`/builder/${newChatId}`);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  return (
    <header className="relative z-50 border-b border-border backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:grid md:grid-cols-3">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                <NotepadTextDashed className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                ResumeGPT
              </span>
            </Link>
          </div>

          {/* Navigation Links - Center (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center justify-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Auth & Theme Toggle - Right */}
          <div className="flex items-center justify-end gap-3">
            {/* Auth Button - Fixed Width Container */}
            <div className="w-[100px] sm:w-[120px] flex justify-end">
              {status === 'loading' ? (
                <Button
                  variant="outline"
                  disabled
                  className="text-sm font-medium flex items-center gap-2 shadow-xs w-full"
                >
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                </Button>
              ) : status === 'authenticated' && session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-muted transition-all duration-200 rounded-lg w-full"
                    >
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline pb-1 font-medium truncate">
                        {session.user.name?.split(' ')[0] || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleNewResume}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Resume</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNewResume}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Go to Chat</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleSignInClick}
                  disabled={isSigningIn}
                  className="text-sm font-medium hover:bg-muted transition-all duration-200 flex items-center gap-2 shadow-xs hover:shadow-md w-full"
                >
                  {isSigningIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      <span className="hidden sm:inline">Sign in</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
