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
  principal: z.coerce.number().min(0, 'Principal must be a positive number.'),
  rate: z.coerce.number().min(0, 'Interest rate must be a positive number.'),
  years: z.coerce.number().int().min(1, 'Term must be at least 1 year.'),
  compoundsPerYear: z.coerce.number().int().min(1, 'Must compound at least annually.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  futureValue: number;
  totalInterest: number;
  principal: number;
};

export default function CompoundInterestCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 10000,
      rate: 7,
      years: 10,
      compoundsPerYear: 12,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { principal, rate, years, compoundsPerYear } = data;
    const P = principal;
    const r = rate / 100;
    const n = compoundsPerYear;
    const t = years;

    const futureValue = P * Math.pow(1 + r / n, n * t);
    const totalInterest = futureValue - P;

    setResult({
      futureValue,
      totalInterest,
      principal: P,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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
                <CardTitle className="font-headline text-2xl">Compound Interest Calculator</CardTitle>
                <CardDescription>Calculate the future value of your investment.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Principal Amount ($)</Label>
                    <Input id="principal" type="number" step="0.01" {...register('principal')} />
                    {errors.principal && <p className="text-destructive text-sm">{errors.principal.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                    <Input id="rate" type="number" step="0.01" {...register('rate')} />
                    {errors.rate && <p className="text-destructive text-sm">{errors.rate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years">Term (Years)</Label>
                    <Input id="years" type="number" {...register('years')} />
                    {errors.years && <p className="text-destructive text-sm">{errors.years.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compoundsPerYear">Compounds per Year</Label>
                    <Input id="compoundsPerYear" type="number" {...register('compoundsPerYear')} />
                    {errors.compoundsPerYear && <p className="text-destructive text-sm">{errors.compoundsPerYear.message}</p>}
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
                  <CardTitle className="font-headline">Investment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className='font-bold'>Future Value:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.futureValue)}</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Principal Amount:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.principal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest Earned:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My investment will be worth ${formatCurrency(result.futureValue)}!`} />
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
                Compound interest is the interest on a loan or deposit calculated based on both the initial principal and the accumulated interest from previous periods.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                  <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      A = P(1 + r/n)^(nt)<br/><br/>
                      <b>A</b> = Future Value<br/>
                      <b>P</b> = Principal Amount<br/>
                      <b>r</b> = Annual Interest Rate<br/>
                      <b>n</b> = Compounds per Year<br/>
                      <b>t</b> = Number of Years
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is the 'magic' of compound interest?</AccordionTrigger>
                      <AccordionContent>
                        The magic comes from earning interest on your interest. Over long periods, this can lead to exponential growth, which is why it's a cornerstone of long-term investing.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>How does the compounding frequency affect the outcome?</AccordionTrigger>
                      <AccordionContent>
                        The more frequently interest is compounded, the more you will earn. Compounding daily will yield slightly more than compounding monthly, which yields more than annually.
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
