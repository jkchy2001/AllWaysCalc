
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
  monthlyInvestment: z.coerce.number().min(1, 'Investment amount must be positive.'),
  rate: z.coerce.number().min(0, 'Interest rate must be positive.'),
  years: z.coerce.number().int().min(1, 'Term must be at least 1 year.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  maturityValue: number;
  totalInterest: number;
  totalInvestment: number;
};

export default function RDCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyInvestment: 5000,
      rate: 7,
      years: 5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { monthlyInvestment, rate, years } = data;
    const P = monthlyInvestment;
    const n = years * 12; // tenure in months
    const r = rate / 100 / 4; // quarterly interest rate

    let maturityValue = 0;
    for (let i = 0; i < n; i++) {
        const monthsRemaining = n - i;
        const numQuarters = Math.floor(monthsRemaining / 3);
        maturityValue += P * Math.pow(1 + r, numQuarters);
    }
    
    // A more standard formula approach:
    const i = rate / 100;
    const t = years;
    const N = 4; // Compounding quarterly
    const maturity = P * ( (Math.pow(1 + i/N, N*t) - 1) / (1 - Math.pow(1+i/N, -1/3)) );


    const totalInvestment = P * n;
    const totalInterest = maturity - totalInvestment;

    setResult({
      maturityValue: maturity,
      totalInterest,
      totalInvestment,
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
                <CardTitle className="font-headline text-2xl">RD Calculator</CardTitle>
                <CardDescription>Calculate the maturity value of your Recurring Deposit.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyInvestment">Monthly Investment (₹)</Label>
                    <Input id="monthlyInvestment" type="number" {...register('monthlyInvestment')} />
                    {errors.monthlyInvestment && <p className="text-destructive text-sm">{errors.monthlyInvestment.message}</p>}
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
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">RD Maturity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className='font-bold'>Maturity Value:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.maturityValue)}</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Investment:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest Earned:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My RD will mature to ${formatCurrency(result.maturityValue)}!`} />
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
                A Recurring Deposit (RD) is a special kind of term deposit where you make regular monthly investments for a fixed period. It's a great way to build savings through disciplined investing.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      M = P × [((1 + r)^n - 1) / (1 - (1 + r)^(-1/3))]<br/><br/>
                      <b>M</b> = Maturity Value<br/>
                      <b>P</b> = Monthly Installment<br/>
                      <b>r</b> = Quarterly Interest Rate (Annual Rate / 4)<br/>
                      <b>n</b> = Number of Quarters (Years * 4)
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What happens if I miss an RD installment?</AccordionTrigger>
                      <AccordionContent>
                        Most banks charge a small penalty for missed RD payments. It's best to check with your specific bank for their policies on missed installments.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Can I withdraw from my RD prematurely?</AccordionTrigger>
                      <AccordionContent>
                        Yes, premature withdrawal is usually allowed, but it often comes with a penalty and a lower interest rate than originally agreed upon.
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
