
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
import { Home, Heart, HeartHandshake } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  date1: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date for Person 1.",
  }),
  date2: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date for Person 2.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  score: number;
  message: string;
};

// Numerology calculation for Life Path Number
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

const getCompatibility = (lp1: number, lp2: number): CalculationResult => {
    const diff = Math.abs(lp1 - lp2);
    let score = 100 - (diff * 9); // Simple scoring algorithm
    score = Math.max(25, score); // Ensure a minimum score

    let message = "A good foundation to build upon.";
    if (score >= 80) message = "An excellent match with deep understanding!";
    else if (score >= 60) message = "A strong connection with great potential.";
    else if (score < 40) message = "A challenging match that requires effort and patience.";
    
    return { score: Math.round(score), message };
}


export default function MarriageDateCompatibilityCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date1: '',
      date2: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const date1 = new Date(data.date1);
    const date2 = new Date(data.date2);

    const lifePath1 = getLifePathNumber(date1);
    const lifePath2 = getLifePathNumber(date2);

    const compatibility = getCompatibility(lifePath1, lifePath2);
    setResult(compatibility);
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
                            <CardTitle className="font-headline text-2xl">Marriage Date Compatibility</CardTitle>
                            <CardDescription>Calculate compatibility based on birth dates using numerology.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date1">Person 1: Date of Birth</Label>
                                    <Input id="date1" type="date" {...register('date1')} />
                                    {errors.date1 && <p className="text-destructive text-sm">{errors.date1.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date2">Person 2: Date of Birth</Label>
                                    <Input id="date2" type="date" {...register('date2')} />
                                    {errors.date2 && <p className="text-destructive text-sm">{errors.date2.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                                    <Heart className="mr-2" /> Calculate Compatibility
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                       <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline text-center">Compatibility Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <HeartHandshake className="mx-auto size-16 text-primary" />
                                <div className="text-6xl font-bold text-primary">{result.score}%</div>
                                <div className="text-muted-foreground">
                                   {result.message}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`Our marriage compatibility score is ${result.score}%!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Disclaimer</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4 font-semibold">
                        This calculator is for entertainment purposes only.
                      </p>
                      <p>
                        The compatibility score is generated by a numerology algorithm based on the birth dates entered. Real relationships are built on love, respect, communication, and shared values—not on numbers. Please enjoy this as a fun activity and not as a serious measure of a relationship's potential.
                      </p>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
