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
  rate: z.coerce.number().min(0, 'Expected return rate must be positive.'),
  years: z.coerce.number().int().min(1, 'Term must be at least 1 year.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  futureValue: number;
  totalInterest: number;
  totalInvestment: number;
};

export default function SIPCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyInvestment: 10000,
      rate: 12,
      years: 10,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { monthlyInvestment, rate, years } = data;
    const P = monthlyInvestment;
    const n = years * 12;
    const i = rate / 100 / 12;

    const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvestment = P * n;
    const totalInterest = futureValue - totalInvestment;

    setResult({
      futureValue,
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
                <CardTitle className="font-headline text-2xl">SIP Calculator</CardTitle>
                <CardDescription>Estimate the future value of your mutual fund investments.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyInvestment">Monthly Investment (₹)</Label>
                    <Input id="monthlyInvestment" type="number" {...register('monthlyInvestment')} />
                    {errors.monthlyInvestment && <p className="text-destructive text-sm">{errors.monthlyInvestment.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Expected Annual Return Rate (%)</Label>
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
                  <Button type="submit" className="w-full">Calculate</Button>
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
                      <span>Total Invested:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wealth Gained:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My SIP investment could grow to ${formatCurrency(result.futureValue)}!`} />
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
                A Systematic Investment Plan (SIP) is a method of investing in mutual funds where you invest a fixed amount of money at regular intervals. This calculator helps project the potential returns on your SIP investments based on an expected rate of return.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      FV = P × [((1 + i)^n - 1) / i] × (1 + i)<br/><br/>
                      <b>FV</b> = Future Value<br/>
                      <b>P</b> = Monthly SIP Amount<br/>
                      <b>i</b> = Monthly Interest Rate (Annual Rate / 12)<br/>
                      <b>n</b> = Number of Months (Years * 12)
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is "Rupee Cost Averaging"?</AccordionTrigger>
                      <AccordionContent>
                        Rupee Cost Averaging is a key benefit of SIPs. By investing a fixed amount regularly, you buy more units when the market is low and fewer units when the market is high. This can average out your purchase cost over time.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Are the returns from a SIP guaranteed?</AccordionTrigger>
                      <AccordionContent>
                        No, SIP returns are not guaranteed. They are linked to the performance of the underlying mutual fund, which in turn depends on market movements. The 'Expected Return Rate' is just an estimate.
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
