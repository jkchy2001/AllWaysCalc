
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
        <div className="p-6 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-headline">{title}</CardTitle>
          {icon}
        </div>
        <CardContent className='pt-0'>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        {links && links.length > 0 && (
            <div className="p-6 pt-0 mt-auto">
                <Separator className="my-2"/>
                <ul className="text-sm space-y-1 mt-4">
                    {links.slice(0, 5).map(link => (
                        <li key={link.name}>
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
                           <span className='text-xs text-muted-foreground'>...and {links.length-5} more.</span>
                       </li>
                    )}
                </ul>
            </div>
        )}
    </Card>
  );
}
