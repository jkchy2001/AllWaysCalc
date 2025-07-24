
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
  initialValue: z.coerce.number().min(0, 'Initial value must be a positive number.'),
  inflationRate: z.coerce.number().min(0, 'Inflation rate must be a positive number.'),
  years: z.coerce.number().int().min(1, 'Years must be at least 1.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  futureValue: number;
  initialValue: number;
  totalDecline: number;
};

export default function InflationCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialValue: 1000,
      inflationRate: 3,
      years: 10,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { initialValue, inflationRate, years } = data;
    const rate = inflationRate / 100;
    const futureValue = initialValue * Math.pow(1 + rate, years);
    
    setResult({
      futureValue,
      initialValue,
      totalDecline: futureValue - initialValue
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
                <CardTitle className="font-headline text-2xl">Inflation Calculator</CardTitle>
                <CardDescription>Calculate the future value of money and see how inflation erodes purchasing power.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialValue">Initial Value (₹)</Label>
                    <p className="text-xs text-muted-foreground">The amount of money today.</p>
                    <Input id="initialValue" type="number" step="0.01" {...register('initialValue')} />
                    {errors.initialValue && <p className="text-destructive text-sm">{errors.initialValue.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Annual Inflation Rate (%)</Label>
                    <p className="text-xs text-muted-foreground">The expected average annual rate of inflation.</p>
                    <Input id="inflationRate" type="number" step="0.01" {...register('inflationRate')} />
                    {errors.inflationRate && <p className="text-destructive text-sm">{errors.inflationRate.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="years">Number of Years</Label>
                    <p className="text-xs text-muted-foreground">The time period over which to calculate the effect of inflation.</p>
                    <Input id="years" type="number" {...register('years')} />
                    {errors.years && <p className="text-destructive text-sm">{errors.years.message}</p>}
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
                  <CardTitle className="font-headline">Purchasing Power</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                        {formatCurrency(result.initialValue)} today will have the same buying power as
                    </p>
                    <div className="text-4xl font-bold text-primary my-2">{formatCurrency(result.futureValue)}</div>
                    <p className="text-muted-foreground">in {form.getValues('years')} years.</p>
                  </div>
                  <div className="text-sm text-center pt-4 border-t">
                    This represents a {(((result.futureValue/result.initialValue) - 1) * 100).toFixed(2)}% decrease in the value of your money.
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`${formatCurrency(result.initialValue)} today will be worth ${formatCurrency(result.futureValue)} in ${form.getValues('years')} years.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Inflation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Inflation is the rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling. This calculator helps you understand how the value of your money may change over time, which is a crucial concept for long-term financial planning.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                  <AccordionContent>
                      <ul className="list-disc pl-5 space-y-2">
                          <li><strong>Initial Value:</strong> The amount of money you have today.</li>
                          <li><strong>Inflation Rate:</strong> The annual percentage increase in the average price level of goods and services.</li>
                          <li><strong>Future Value:</strong> The amount of money that would be needed in the future to purchase the same goods and services that the initial value can purchase today.</li>
                          <li><strong>Purchasing Power:</strong> The value of a currency expressed in terms of the amount of goods or services that one unit of money can buy. Inflation erodes purchasing power.</li>
                      </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Why is this important for investments?</AccordionTrigger>
                  <AccordionContent>
                   For your savings to grow in real terms, your investment returns must be higher than the rate of inflation. If your investments earn 7% in a year where inflation is 4%, your real rate of return is only 3%. If your savings are in an account earning less than inflation, you are effectively losing money. Understanding inflation helps you set realistic goals for your investments to outpace rising costs.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                  <AccordionTrigger>What is a typical inflation rate?</AccordionTrigger>
                  <AccordionContent>
                    The inflation rate varies significantly by country and over time. In many developed economies, central banks aim for an annual inflation rate of around 2-3%. In developing economies like India, it has historically been higher. You can look up the current Consumer Price Index (CPI) inflation rate for your country for a more accurate input.
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
              <Link href="/compound-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Compound Interest</p>
              </Link>
              <Link href="/sip-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">SIP Calculator</p>
              </Link>
              <Link href="/retirement-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Retirement Calculator</p>
              </Link>
               <Link href="/cagr-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">CAGR Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
