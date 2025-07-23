
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home, Sparkles } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const numerologyData = {
    1: { name: 'The Leader', traits: 'Independent, pioneering, and a natural leader. Tends to be ambitious and self-reliant.', keywords: 'Leadership, Independence, Innovation' },
    2: { name: 'The Diplomat', traits: 'Cooperative, sensitive, and a natural peacemaker. Values harmony and relationships.', keywords: 'Cooperation, Harmony, Sensitivity' },
    3: { name: 'The Communicator', traits: 'Expressive, creative, and sociable. Enjoys communication and self-expression.', keywords: 'Creativity, Communication, Joy' },
    4: { name: 'The Builder', traits: 'Practical, organized, and hardworking. Values stability, order, and discipline.', keywords: 'Stability, Discipline, Hard Work' },
    5: { name: 'The Adventurer', traits: 'Loves freedom, adventure, and change. Adaptable, curious, and versatile.', keywords: 'Freedom, Adventure, Change' },
    6: { name: 'The Nurturer', traits: 'Responsible, caring, and community-oriented. Seeks to serve and support others.', keywords: 'Responsibility, Nurturing, Community' },
    7: { name: 'The Seeker', traits: 'Analytical, introspective, and spiritual. Seeks knowledge and truth.', keywords: 'Analysis, Spirituality, Wisdom' },
    8: { name: 'The Powerhouse', traits: 'Ambitious, authoritative, and business-savvy. Strives for success and material achievement.', keywords: 'Abundance, Power, Success' },
    9: { name: 'The Humanitarian', traits: 'Compassionate, idealistic, and generous. Has a broad vision for a better world.', keywords: 'Compassion, Idealism, Humanitarianism' },
    11: { name: 'The Visionary', traits: 'Intuitive, charismatic, and idealistic. Possesses a heightened spiritual awareness and a desire to inspire.', keywords: 'Intuition, Illumination, Vision' },
    22: { name: 'The Master Builder', traits: 'Combines the practicality of the 4 with the grand vision of the 11. Can turn dreams into reality.', keywords: 'Vision, Pragmatism, Manifestation' },
};

type NumerologyResult = {
    lifePathNumber: number;
} & typeof numerologyData[1];


const reduceNumber = (num: number): number => {
    if (num === 11 || num === 22) return num;
    let sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    if (sum > 9 && sum !== 11 && sum !== 22) {
        return reduceNumber(sum);
    }
    return sum;
};

const getLifePathNumber = (date: Date): number => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    const reducedMonth = reduceNumber(month);
    const reducedDay = reduceNumber(day);
    const reducedYear = reduceNumber(year);

    const lifePathSum = reducedMonth + reducedDay + reducedYear;
    return reduceNumber(lifePathSum);
}


export default function NumerologyCalculatorPage() {
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const birthDate = new Date(data.birthDate);
    const lifePathNumber = getLifePathNumber(birthDate);
    const signInfo = numerologyData[lifePathNumber as keyof typeof numerologyData];
    
    if(signInfo) {
        setResult({ lifePathNumber, ...signInfo });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
        <Header />
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                        <Home className="size-4" /> Home
                    </Link>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Numerology Calculator</CardTitle>
                            <CardDescription>Discover your Life Path Number based on your birth date.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">Your Date of Birth</Label>
                                    <Input id="birthDate" type="date" {...register('birthDate')} />
                                    {errors.birthDate && <p className="text-destructive text-sm">{errors.birthDate.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Find My Life Path</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                       <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline text-center">Your Life Path Number</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.lifePathNumber}</div>
                                <div className="text-2xl font-semibold">{result.name}</div>
                                <div className="text-muted-foreground">{result.traits}</div>
                                <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider pt-2">
                                    {result.keywords}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My Life Path Number is ${result.lifePathNumber}, ${result.name}!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Numerology</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        Numerology is the belief in a mystical relationship between numbers and life events. Your Life Path Number, derived from your date of birth, is one of the most significant numbers, said to reveal your life's purpose and the path you are destined to walk.
                      </p>
                       <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What are Master Numbers?</AccordionTrigger>
                              <AccordionContent>
                               In numerology, 11 and 22 are considered "Master Numbers." They hold a greater potential for achievement and success, but also come with more challenges and responsibility. They are not reduced to a single digit.
                              </AccordionContent>
                          </AccordionItem>
                      </Accordion>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
