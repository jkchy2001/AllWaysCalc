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
  years: z.coerce.number().min(0, 'Term must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalValue: number;
  totalInterest: number;
  principal: number;
};

export default function SimpleInterestCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 10000,
      rate: 5,
      years: 5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { principal, rate, years } = data;
    const P = principal;
    const r = rate / 100;
    const t = years;

    const totalInterest = P * r * t;
    const totalValue = P + totalInterest;

    setResult({
      totalValue,
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
                <CardTitle className="font-headline text-2xl">Simple Interest Calculator</CardTitle>
                <CardDescription>Calculate interest without compounding.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Principal Amount (₹)</Label>
                    <p className="text-xs text-muted-foreground">The initial amount of your loan or investment.</p>
                    <Input id="principal" type="number" step="0.01" {...register('principal')} />
                    {errors.principal && <p className="text-destructive text-sm">{errors.principal.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                    <p className="text-xs text-muted-foreground">The yearly rate of interest.</p>
                    <Input id="rate" type="number" step="0.01" {...register('rate')} />
                    {errors.rate && <p className="text-destructive text-sm">{errors.rate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years">Term (Years)</Label>
                     <p className="text-xs text-muted-foreground">The total duration of the loan or investment.</p>
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
                  <CardTitle className="font-headline">Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between items-center border-b pb-4">
                    <span className='font-bold'>Total Value:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.totalValue)}</span>
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
                  <SharePanel resultText={`With simple interest, my total value will be ${formatCurrency(result.totalValue)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Simple Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Simple interest is a quick method of calculating the interest charge on a loan or investment. It is determined by multiplying the daily interest rate by the principal by the number of days that elapse between payments. Unlike compound interest, it is always calculated on the original principal amount.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Formula Explained</AccordionTrigger>
                  <AccordionContent>
                    <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      I = P * r * t<br/><br/>
                      <b>I</b> = Simple Interest<br/>
                      <b>P</b> = Principal Amount<br/>
                      <b>r</b> = Annual Interest Rate (as a decimal)<br/>
                      <b>t</b> = Term in Years
                    </code>
                  </pre>
                  The Total Value is then `P + I`.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Simple vs. Compound Interest</AccordionTrigger>
                  <AccordionContent>
                    The key difference is that simple interest is calculated only on the principal amount of a loan or deposit. In contrast, compound interest is calculated on the principal amount and also on the accumulated interest of previous periods. This "interest on interest" effect makes compound interest grow much faster over time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>When is simple interest used?</AccordionTrigger>
                  <AccordionContent>
                    Simple interest is most often used for short-term loans. For example, some car loans and retail installment loans (like for furniture or appliances) use simple interest. Most savings accounts, credit cards, and long-term investments use compound interest.
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
              <Link href="/fd-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">FD Calculator</p>
              </Link>
               <Link href="/loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Loan / EMI Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
