
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
  name1: z.string().min(1, 'Please enter the first name.'),
  name2: z.string().min(1, 'Please enter the second name.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  score: number;
};

// A simple, deterministic algorithm for a "fun" score
const calculateLoveScore = (name1: string, name2: string): number => {
  const combinedNames = (name1 + name2).toLowerCase().replace(/[^a-z]/g, '');
  let charSum = 0;
  for (let i = 0; i < combinedNames.length; i++) {
    charSum += combinedNames.charCodeAt(i);
  }
  
  // Use a seed from the names length to make it more "unique"
  const seed = name1.length * name2.length;
  const score = (charSum + seed) % 101; // Get a score between 0 and 100
  
  // Make scores feel more positive, ensuring a minimum of 40%
  return Math.max(40, score);
};

export default function LoveCompatibilityCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name1: '',
      name2: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const score = calculateLoveScore(data.name1, data.name2);
    setResult({ score });
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
                            <CardTitle className="font-headline text-2xl">Love Compatibility Calculator</CardTitle>
                            <CardDescription>Find out your compatibility score based on your names.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name1">Your Name</Label>
                                    <Input id="name1" placeholder="e.g., Alex" {...register('name1')} />
                                    {errors.name1 && <p className="text-destructive text-sm">{errors.name1.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name2">Their Name</Label>
                                    <Input id="name2" placeholder="e.g., Taylor" {...register('name2')} />
                                    {errors.name2 && <p className="text-destructive text-sm">{errors.name2.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                                    <Heart className="mr-2" /> Calculate Score
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
                                   A fun score for {form.getValues('name1')} and {form.getValues('name2')}.
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`Our love compatibility score is ${result.score}%!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How It Works & Disclaimer</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        This fun calculator generates a "love score" based on the characters in two names. The names are combined, and a score is calculated using a simple algorithm involving the character codes and lengths of the names.
                      </p>
                      <p className="font-semibold text-destructive">
                        This calculator is for entertainment purposes only. Real relationships are complex and depend on much more than names. Have fun, but don't take the results too seriously!
                      </p>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
