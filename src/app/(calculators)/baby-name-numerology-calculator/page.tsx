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
  name: z.string().min(1, { message: "Please enter a name." }),
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

const letterValues: { [key: string]: number } = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

type NumerologyResult = {
    destinyNumber: number;
} & typeof numerologyData[1];

const reduceNumber = (num: number): number => {
    if (num === 11 || num === 22) return num;
    let sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    if (sum > 9 && sum !== 11 && sum !== 22) {
        return reduceNumber(sum);
    }
    return sum;
};

const getDestinyNumber = (name: string): number => {
    const cleanedName = name.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;
    for (const char of cleanedName) {
        sum += letterValues[char] || 0;
    }
    return reduceNumber(sum);
};


export default function BabyNameNumerologyCalculatorPage() {
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const destinyNumber = getDestinyNumber(data.name);
    const signInfo = numerologyData[destinyNumber as keyof typeof numerologyData];
    
    if(signInfo) {
        setResult({ destinyNumber, ...signInfo });
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
                            <CardTitle className="font-headline text-2xl">Baby Name Numerology Calculator</CardTitle>
                            <CardDescription>Discover the Destiny Number hidden in a name based on numerological principles.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <p className="text-xs text-muted-foreground">Enter the full name as it would appear on a birth certificate for the most accurate reading.</p>
                                    <Input id="name" placeholder="e.g., John Appleseed" {...register('name')} />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Find Destiny Number</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                       <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline text-center">Destiny (Expression) Number</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.destinyNumber}</div>
                                <div className="text-2xl font-semibold">{result.name}</div>
                                <div className="text-muted-foreground">{result.traits}</div>
                                <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider pt-2">
                                    {result.keywords}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`The Destiny Number for ${form.getValues('name')} is ${result.destinyNumber}, ${result.name}!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Name Numerology</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        In numerology, the Destiny Number (or Expression Number) is calculated from the letters of your full birth name. It's said to reveal your natural talents, abilities, and the general direction of your life. This calculator is a fun tool to explore this concept for baby names or your own name.
                      </p>
                       <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>How is it calculated?</AccordionTrigger>
                              <AccordionContent>
                               <p>Each letter is assigned a number from 1 to 9 based on the Chaldean numerology system. The numbers corresponding to all letters in the full name are added together. This sum is then repeatedly reduced by adding its digits until a single-digit number, or a Master Number (11 or 22), is reached. This final number is the Destiny Number.</p>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Disclaimer</AccordionTrigger>
                              <AccordionContent>
                               <p>This calculator is for entertainment purposes only. Numerology is a belief system and is not based on scientific evidence. Enjoy the insights as a fun way to think about names and personality traits.</p>
                              </AccordionContent>
                          </AccordionItem>
                      </Accordion>
                  </CardContent>
                </Card>
                <Card className="mt-8">
                    <CardHeader>
                    <CardTitle>Related Calculators</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/numerology-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Numerology Calculator</p>
                        </Link>
                        <Link href="/love-compatibility-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Love Compatibility</p>
                        </Link>
                        <Link href="/zodiac-sign-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Zodiac Sign</p>
                        </Link>
                        <Link href="/lucky-number-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Lucky Number</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
