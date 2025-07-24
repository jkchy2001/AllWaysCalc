import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AllWaysCalc. All Rights Reserved.</p>
        <nav className="flex items-center gap-4 md:gap-6 mt-4 md:mt-0 flex-wrap justify-center">
          <Link href="/about-us" className="hover:text-primary transition-colors">
            About Us
          </Link>
           <Link href="/contact-us" className="hover:text-primary transition-colors">
            Contact Us
          </Link>
          <Link href="/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/disclaimer" className="hover:text-primary transition-colors">
            Disclaimer
          </Link>
        </nav>
      </div>
    </footer>
  );
}
