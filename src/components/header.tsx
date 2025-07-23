import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Menu, Calculator } from 'lucide-react';
import { Logo } from '@/components/icons';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">
              AllWaysCalc
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium mx-auto">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            Calculators
          </Link>
          <Link
            href="#"
            className="transition-colors hover:text-foreground/80 text-muted-foreground"
          >
            FAQ
          </Link>
        </nav>
        
        <div className="md:hidden ml-auto">
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
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation for mobile devices
              </SheetDescription>
              <Link href="/" className="flex items-center space-x-2">
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
                <Link
                  href="#"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  FAQ
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
