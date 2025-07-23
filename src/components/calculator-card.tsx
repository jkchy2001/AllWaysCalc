import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowRight } from 'lucide-react';
import { Separator } from './ui/separator';

interface CalculatorCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  links: { href: string; name: string; icon?: React.ReactNode }[];
}

export function CalculatorCard({ href, icon, title, description, links }: CalculatorCardProps) {
  return (
    <Card className="flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50">
        <Link href={href} className="group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
            </CardHeader>
            <CardContent>
            <div className="text-lg font-bold font-headline">{title}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Link>
        {links && links.length > 0 && (
            <div className="p-4 pt-0 mt-auto">
                <Separator className="my-2"/>
                <ul className="text-sm space-y-1">
                    {links.slice(0, 5).map(link => (
                        <li key={link.href}>
                            <Link href={link.href} className="text-muted-foreground hover:text-primary flex items-center justify-between group">
                                <span className='flex items-center gap-2'>
                                  {link.icon}
                                  {link.name}
                                </span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </li>
                    ))}
                    {links.length > 5 && (
                         <li>
                            <Link href={href} className="text-primary font-semibold text-xs flex items-center justify-between group">
                                <span>View all...</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        )}
    </Card>
  );
}
