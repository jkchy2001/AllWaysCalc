import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/icons';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">
              AllWaysCalc
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <Link href="/" className="flex items-center space-x-2 mb-6">
                  <Logo className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline">AllWaysCalc</span>
                </Link>
                <div className="grid gap-4 py-6">
                  <Link
                    href="/"
                    className="flex w-full items-center py-2 text-lg font-semibold"
                  >
                    Calculators
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
