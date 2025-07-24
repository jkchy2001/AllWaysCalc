
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
import { Home } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  numbers: z.string().min(1, 'Please enter at least two numbers.').refine(
    (value) => {
      const nums = value.split(',').map(n => n.trim()).filter(n => n !== '');
      return nums.length >= 2 && nums.every(n => !isNaN(Number(n)) && Number.isInteger(Number(n)) && Number(n) > 0);
    },
    {
      message: "Please enter at least two comma-separated positive integers.",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    lcm: number;
    hcf: number;
};

export default function LcmHcfCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numbers: '12, 15, 75',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const hcf = (a: number, b: number): number => {
    return b === 0 ? a : hcf(b, a % b);
  };

  const lcm = (a: number, b: number): number => {
    return (a * b) / hcf(a, b);
  };

  const onSubmit = (data: FormValues) => {
    const numbers = data.numbers.split(',').map(n => parseInt(n.trim(), 10));
    
    const calculatedHcf = numbers.reduce((a, b) => hcf(a, b));
    const calculatedLcm = numbers.reduce((a, b) => lcm(a, b));

    setResult({
        lcm: calculatedLcm,
        hcf: calculatedHcf,
    });
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
                            <CardTitle className="font-headline text-2xl">LCM & HCF Calculator</CardTitle>
                            <CardDescription>Find the Lowest Common Multiple and Highest Common Factor.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numbers">Numbers (comma-separated)</Label>
                                    <Input id="numbers" placeholder="e.g., 8, 12, 16" {...register('numbers')} />
                                    {errors.numbers && <p className="text-destructive text-sm">{errors.numbers.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-background">
                                        <p className="text-sm text-muted-foreground">HCF</p>
                                        <p className="text-4xl font-bold text-primary">{result.hcf}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background">
                                        <p className="text-sm text-muted-foreground">LCM</p>
                                        <p className="text-4xl font-bold text-primary">{result.lcm}</p>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`The HCF is ${result.hcf} and the LCM is ${result.lcm}.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        This calculator finds the Highest Common Factor (HCF), also known as the Greatest Common Divisor (GCD), and the Lowest Common Multiple (LCM) of a set of integers.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Methodology</h3>
                          <p>
                              The HCF is found using the Euclidean algorithm, which repeatedly applies the division algorithm. The LCM is found using the formula that relates the two: `LCM(a, b) = (|a * b|) / HCF(a, b)`.
                          </p>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What is HCF?</AccordionTrigger>
                              <AccordionContent>
                                The Highest Common Factor (HCF) of two or more integers is the largest positive integer that divides each of the integers without leaving a remainder.
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-2">
                              <AccordionTrigger>What is LCM?</AccordionTrigger>
                              <AccordionContent>
                                The Lowest Common Multiple (LCM) of two or more integers is the smallest positive integer that is divisible by each of the integers.
                              </AccordionContent>
                          </AccordionItem>
                          </Accordion>
                      </div>
                      </div>
                  </CardContent>
                </Card>
                 <Card className="mt-8">
                    <CardHeader>
                      <CardTitle>Related Calculators</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/permutations-combinations-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                        <p className="font-semibold">Permutations & Combinations</p>
                      </Link>
                      <Link href="/probability-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                        <p className="font-semibold">Probability Calculator</p>
                      </Link>
                      <Link href="/mean-median-mode-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                        <p className="font-semibold">Mean, Median, Mode</p>
                      </Link>
                      <Link href="/percentage-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                        <p className="font-semibold">Percentage Calculator</p>
                      </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
