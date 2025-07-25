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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  calcType: z.enum(['single', 'two_independent']),
  favorableA: z.coerce.number().min(0, "Must be non-negative"),
  totalA: z.coerce.number().min(1, "Must be at least 1"),
  favorableB: z.coerce.number().min(0, "Must be non-negative").optional(),
  totalB: z.coerce.number().min(1, "Must be at least 1").optional(),
}).refine(data => data.favorableA <= data.totalA, {
    message: "Favorable outcomes cannot exceed total outcomes for Event A.",
    path: ["favorableA"],
}).refine(data => {
    if (data.calcType === 'two_independent') {
        return data.favorableB !== undefined && data.totalB !== undefined && data.favorableB <= data.totalB;
    }
    return true;
}, {
    message: "Please define Event B, and ensure its favorable outcomes don't exceed total outcomes.",
    path: ["favorableB"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  probabilityDecimal: number;
  probabilityPercent: number;
  odds: string;
};

export default function ProbabilityCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calcType: 'single',
      favorableA: 1,
      totalA: 6,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const calcType = watch('calcType');

  const onSubmit = (data: FormValues) => {
    let probabilityDecimal = 0;
    const probA = data.favorableA / data.totalA;

    if (data.calcType === 'single') {
      probabilityDecimal = probA;
    } else if (data.calcType === 'two_independent' && data.favorableB !== undefined && data.totalB) {
      const probB = data.favorableB / data.totalB;
      probabilityDecimal = probA * probB;
    }
    
    const probabilityPercent = probabilityDecimal * 100;
    const oddsFavorable = probabilityDecimal;
    const oddsAgainst = 1 - oddsFavorable;
    
    // Simplification of odds not implemented, showing as ratio to 1
    const odds = `${(oddsAgainst / oddsFavorable).toFixed(2)} to 1 against`;


    setResult({
      probabilityDecimal,
      probabilityPercent,
      odds,
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
                <CardTitle className="font-headline text-2xl">Probability Calculator</CardTitle>
                <CardDescription>Calculate the probability of events.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                   <RadioGroup
                        defaultValue="single"
                        className="grid grid-cols-2 gap-4"
                        onValueChange={(value) => form.setValue('calcType', value as 'single' | 'two_independent')}
                        {...register('calcType')}
                    >
                        <div>
                            <RadioGroupItem value="single" id="single" className="peer sr-only" />
                            <Label htmlFor="single" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Single Event</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="two_independent" id="two_independent" className="peer sr-only" />
                            <Label htmlFor="two_independent" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Two Events (A and B)</Label>
                        </div>
                    </RadioGroup>
                    
                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold">Event A</h3>
                        <div className="flex gap-4">
                            <div className="space-y-2 w-1/2">
                                <Label htmlFor="favorableA">Favorable Outcomes</Label>
                                <Input id="favorableA" type="number" {...register('favorableA')} />
                            </div>
                            <div className="space-y-2 w-1/2">
                                <Label htmlFor="totalA">Total Outcomes</Label>
                                <Input id="totalA" type="number" {...register('totalA')} />
                            </div>
                        </div>
                         {errors.favorableA && <p className="text-destructive text-sm">{errors.favorableA.message}</p>}
                    </div>

                    {calcType === 'two_independent' && (
                        <div className="p-4 border rounded-md space-y-4">
                            <h3 className="font-semibold">Event B</h3>
                             <div className="flex gap-4">
                                <div className="space-y-2 w-1/2">
                                    <Label htmlFor="favorableB">Favorable Outcomes</Label>
                                    <Input id="favorableB" type="number" {...register('favorableB')} />
                                </div>
                                <div className="space-y-2 w-1/2">
                                    <Label htmlFor="totalB">Total Outcomes</Label>
                                    <Input id="totalB" type="number" {...register('totalB')} />
                                </div>
                            </div>
                            {errors.favorableB && <p className="text-destructive text-sm">{errors.favorableB.message}</p>}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Probability</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Probability Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <div className="text-6xl font-bold text-primary">{result.probabilityPercent.toFixed(2)}%</div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                     <div className="p-2 rounded-lg bg-background">
                        <p className="text-sm text-muted-foreground">As a Decimal</p>
                        <p className="text-2xl font-bold text-primary">{result.probabilityDecimal.toFixed(4)}</p>
                    </div>
                     <div className="p-2 rounded-lg bg-background">
                        <p className="text-sm text-muted-foreground">As Odds</p>
                        <p className="text-2xl font-bold text-primary">{result.odds}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The probability is ${result.probabilityPercent.toFixed(2)}%.`} />
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
                Probability measures the likelihood of an event occurring. This calculator helps you compute basic probabilities for single events or the combined probability of two independent events.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formulas Used</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Probability of a Single Event</AccordionTrigger>
                      <AccordionContent>
                        This is the most basic form of probability.
                         <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              P(A) = Favorable Outcomes / Total Outcomes
                          </code>
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Probability of Two Independent Events (A and B)</AccordionTrigger>
                      <AccordionContent>
                        This calculates the chance of both Event A and Event B happening. The events must be independent, meaning the outcome of one does not affect the outcome of the other.
                        <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              P(A and B) = P(A) * P(B)
                          </code>
                        </pre>
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
