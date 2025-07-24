
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
  numbers: z.string().min(1, 'Please enter at least one number.').refine(
    (value) => {
      const nums = value.split(',').map(n => n.trim()).filter(n => n !== '');
      return nums.length >= 1 && nums.every(n => !isNaN(Number(n)));
    },
    {
      message: "Please enter a valid comma-separated list of numbers.",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    mean: number;
    median: number;
    mode: number[];
};

export default function MeanMedianModeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numbers: '1, 5, 7, 7, 8, 9, 12, 15',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const calculateMean = (nums: number[]): number => {
    const sum = nums.reduce((acc, val) => acc + val, 0);
    return sum / nums.length;
  };

  const calculateMedian = (nums: number[]): number => {
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const calculateMode = (nums: number[]): number[] => {
    const frequency: { [key: number]: number } = {};
    nums.forEach(num => frequency[num] = (frequency[num] || 0) + 1);

    let maxFreq = 0;
    for (const key in frequency) {
        if (frequency[key] > maxFreq) {
            maxFreq = frequency[key];
        }
    }

    if (maxFreq === 1) return []; // No mode if all numbers appear once

    const modes: number[] = [];
    for (const key in frequency) {
        if (frequency[key] === maxFreq) {
            modes.push(Number(key));
        }
    }
    return modes;
  };

  const onSubmit = (data: FormValues) => {
    const numbers = data.numbers.split(',').map(n => parseFloat(n.trim()));
    
    const mean = calculateMean(numbers);
    const median = calculateMedian(numbers);
    const mode = calculateMode(numbers);

    setResult({
        mean,
        median,
        mode
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                            <CardTitle className="font-headline text-2xl">Mean, Median & Mode Calculator</CardTitle>
                            <CardDescription>Find the central tendency of a dataset.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numbers">Numbers (comma-separated)</Label>
                                    <Input id="numbers" placeholder="e.g., 2, 3, 3, 5, 7, 10" {...register('numbers')} />
                                    {errors.numbers && <p className="text-destructive text-sm">{errors.numbers.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg bg-background">
                                        <p className="text-sm text-muted-foreground">Mean</p>
                                        <p className="text-3xl font-bold text-primary">{result.mean.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background">
                                        <p className="text-sm text-muted-foreground">Median</p>
                                        <p className="text-3xl font-bold text-primary">{result.median}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-background">
                                        <p className="text-sm text-muted-foreground">Mode</p>
                                        <p className="text-3xl font-bold text-primary truncate">
                                            {result.mode.length > 0 ? result.mode.join(', ') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`Mean: ${result.mean.toFixed(2)}, Median: ${result.median}, Mode: ${result.mode.length > 0 ? result.mode.join(', ') : 'N/A'}.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding the Measures</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        Mean, median, and mode are three kinds of "averages" or measures of central tendency. Each tells you something different about a set of data.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What is the Mean?</AccordionTrigger>
                              <AccordionContent>
                                The mean is the most common type of average. It's calculated by adding all the numbers in a set and then dividing by the count of numbers. It's sensitive to outliers (very large or small numbers).
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-2">
                              <AccordionTrigger>What is the Median?</AccordionTrigger>
                              <AccordionContent>
                                The median is the middle value in a dataset that has been sorted in order. If there is an even number of values, the median is the average of the two middle numbers. It's less affected by outliers than the mean.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>What is the Mode?</AccordionTrigger>
                              <AccordionContent>
                                The mode is the number that appears most frequently in a dataset. A dataset can have one mode, more than one mode (multimodal), or no mode at all if all numbers appear with the same frequency.
                              </AccordionContent>
                          </AccordionItem>
                          </Accordion>
                      </div>
                      </div>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
