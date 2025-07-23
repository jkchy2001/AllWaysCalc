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
  principal: z.coerce.number().min(1, 'Investment amount must be positive.'),
  rate: z.coerce.number().min(0, 'Expected return rate must be positive.'),
  years: z.coerce.number().int().min(1, 'Term must be at least 1 year.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  futureValue: number;
  totalInterest: number;
  principal: number;
};

export default function LumpsumCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 100000,
      rate: 12,
      years: 10,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { principal, rate, years } = data;
    const P = principal;
    const r = rate / 100;
    const t = years;

    const futureValue = P * Math.pow(1 + r, t);
    const totalInterest = futureValue - P;

    setResult({
      futureValue,
      totalInterest,
      principal: P,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
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
                <CardTitle className="font-headline text-2xl">Lumpsum Calculator</CardTitle>
                <CardDescription>Calculate the future value of a one-time investment.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Total Investment (₹)</Label>
                    <Input id="principal" type="number" {...register('principal')} />
                    {errors.principal && <p className="text-destructive text-sm">{errors.principal.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Expected Annual Return (%)</Label>
                    <Input id="rate" type="number" step="0.01" {...register('rate')} />
                    {errors.rate && <p className="text-destructive text-sm">{errors.rate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years">Investment Period (Years)</Label>
                    <Input id="years" type="number" {...register('years')} />
                    {errors.years && <p className="text-destructive text-sm">{errors.years.message}</p>}
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
                  <CardTitle className="font-headline">Investment Projection</CardTitle>
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
                      <span>Wealth Gained:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My lumpsum investment could grow to ${formatCurrency(result.futureValue)}!`} />
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
                A lumpsum investment is a one-time investment of a significant amount of money into a financial instrument. This calculator projects its growth over time based on an expected annual rate of return.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Future Value = P * (1 + r)^t<br/><br/>
                      <b>P</b> = Principal Amount (Lumpsum)<br/>
                      <b>r</b> = Annual Rate of Return<br/>
                      <b>t</b> = Term in Years
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Is lumpsum better than SIP?</AccordionTrigger>
                      <AccordionContent>
                        Both have their advantages. Lumpsum can generate higher returns if the market performs well right after you invest. SIPs (Systematic Investment Plans) average out the purchase cost and are less risky if the market is volatile.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What kind of returns can I expect?</AccordionTrigger>
                      <AccordionContent>
                        Returns depend on the investment vehicle. Equity mutual funds have historically offered higher returns (e.g., 12-15%) but come with higher risk. Fixed deposits or bonds offer lower, more predictable returns.
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
