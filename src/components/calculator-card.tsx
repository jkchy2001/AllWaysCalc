import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowRight } from 'lucide-react';

interface CalculatorCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function CalculatorCard({ href, icon, title, description }: CalculatorCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold font-headline">{title}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Use Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
