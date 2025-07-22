import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Menu, Calculator } from 'lucide-react';
import { Logo } from '@/components/icons';
import { SuggestionDialog } from '@/components/suggestion-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              AllWaysCalc
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/tip-calculator"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Calculators
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              FAQ
            </Link>
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline">AllWaysCalc</span>
            </Link>
            <div className="grid gap-4 py-6">
              <Link
                href="/tip-calculator"
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
        <div className="flex flex-1 items-center justify-end space-x-4">
          <SuggestionDialog>
            <Button variant="outline">
              <Calculator className="mr-2 h-4 w-4" /> Suggest a Calculator
            </Button>
          </SuggestionDialog>
        </div>
      </div>
    </header>
  );
}
