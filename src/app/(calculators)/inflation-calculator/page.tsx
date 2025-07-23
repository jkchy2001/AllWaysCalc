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
                <CardTitle className="font-headline text-2xl">Inflation Calculator</CardTitle>
                <CardDescription>Calculate the future value of money.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialValue">Initial Value (₹)</Label>
                    <Input id="initialValue" type="number" step="0.01" {...register('initialValue')} />
                    {errors.initialValue && <p className="text-destructive text-sm">{errors.initialValue.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inflationRate">Annual Inflation Rate (%)</Label>
                    <Input id="inflationRate" type="number" step="0.01" {...register('inflationRate')} />
                    {errors.inflationRate && <p className="text-destructive text-sm">{errors.inflationRate.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="years">Number of Years</Label>
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
                    A {(((result.futureValue/result.initialValue) - 1) * 100).toFixed(2)}% decrease in purchasing power.
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
                Inflation is the rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling. This calculator helps you understand how the value of your money may change over time.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Future Value = Present Value * (1 + Inflation Rate)^Years
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is a typical inflation rate?</AccordionTrigger>
                      <AccordionContent>
                        The inflation rate varies significantly by country and over time. In many developed economies, central banks aim for an annual inflation rate of around 2-3%.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>How does this affect my savings?</AccordionTrigger>
                      <AccordionContent>
                        If the interest you earn on your savings is lower than the inflation rate, your money is losing purchasing power. It's important to invest in assets that have the potential to grow faster than inflation.
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
