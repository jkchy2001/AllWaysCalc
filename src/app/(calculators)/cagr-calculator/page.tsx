'use client';

import type { Metadata } from 'next';
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
  initialValue: z.coerce.number().min(0.01, 'Initial value must be greater than zero.'),
  finalValue: z.coerce.number().min(0, 'Final value must be a positive number.'),
  years: z.coerce.number().int().min(1, 'Years must be at least 1.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  cagr: number;
};

export default function CAGRCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialValue: 100000,
      finalValue: 250000,
      years: 5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { initialValue, finalValue, years } = data;
    const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
    
    setResult({
      cagr
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
                <CardTitle className="font-headline text-2xl">CAGR Calculator</CardTitle>
                <CardDescription>Calculate the Compound Annual Growth Rate to measure an investment's annual growth over a period.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialValue">Initial Value (₹)</Label>
                    <p className="text-xs text-muted-foreground">The starting value of the investment.</p>
                    <Input id="initialValue" type="number" step="0.01" {...register('initialValue')} />
                    {errors.initialValue && <p className="text-destructive text-sm">{errors.initialValue.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="finalValue">Final Value (₹)</Label>
                    <p className="text-xs text-muted-foreground">The value of the investment at the end of the period.</p>
                    <Input id="finalValue" type="number" step="0.01" {...register('finalValue')} />
                    {errors.finalValue && <p className="text-destructive text-sm">{errors.finalValue.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="years">Number of Years</Label>
                    <p className="text-xs text-muted-foreground">The total duration of the investment.</p>
                    <Input id="years" type="number" {...register('years')} />
                    {errors.years && <p className="text-destructive text-sm">{errors.years.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate CAGR</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">CAGR Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="text-4xl font-bold text-primary">{result.cagr.toFixed(2)}%</div>
                    <p className="text-muted-foreground">Is the compound annual growth rate of your investment.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The CAGR of my investment is ${result.cagr.toFixed(2)}%`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding CAGR</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               The Compound Annual Growth Rate (CAGR) is the rate of return that would be required for an investment to grow from its beginning balance to its ending balance, assuming the profits were reinvested at the end of each year of the investment’s lifespan.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Formula Used</AccordionTrigger>
                  <AccordionContent>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      CAGR = ((Ending Value / Beginning Value)^(1 / N)) - 1<br/><br/>
                      <b>N</b> = Number of Years
                    </code>
                  </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>FAQs</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">What does CAGR tell you?</h4>
                        <p>CAGR isn't the actual return in reality. It's an imaginary number that describes the rate at which an investment would have grown if it grew at a steady rate. You can think of it as a way to smooth out the returns over time, making it easier to compare the performance of different investments.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Is CAGR better than average returns?</h4>
                        <p>CAGR is often considered a better measure than simple average return because it accounts for the effect of compounding. The simple average can be misleading if the investment returns are volatile.</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">What are the limitations of CAGR?</h4>
                        <p>CAGR's main limitation is that it's a historical measure and does not indicate future returns. It also assumes a smooth, constant growth rate, which rarely happens in real-world investments. It is a representation of growth, not a true return rate.</p>
                    </div>
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
              <Link href="/sip-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">SIP Calculator</p>
              </Link>
              <Link href="/lumpsum-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Lumpsum Calculator</p>
              </Link>
              <Link href="/compound-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Compound Interest</p>
              </Link>
              <Link href="/inflation-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Inflation Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
