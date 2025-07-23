import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AllWaysCalc. All Rights Reserved.</p>
        <nav className="flex items-center gap-4 md:gap-6 mt-4 md:mt-0">
          <Link href="/privacy-policy" className="hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-primary">
            Terms & Conditions
          </Link>
          <Link href="/disclaimer" className="hover:text-primary">
            Disclaimer
          </Link>
        </nav>
      </div>
    </footer>
  );
}
