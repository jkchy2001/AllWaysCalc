
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credit Card Payoff Calculator',
  description: 'Estimate how long it will take to pay off your credit card balance and the total interest you\'ll pay. See the impact of making more than the minimum payment.',
};

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
import { Home, CreditCard } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  balance: z.coerce.number().min(1, 'Outstanding balance must be positive.'),
  apr: z.coerce.number().min(0, 'APR must be a positive number.').max(100, 'APR seems high'),
  monthlyPayment: z.coerce.number().min(1, 'Monthly payment must be positive.'),
}).refine(data => {
    // Check if monthly payment is enough to cover first month's interest
    const monthlyInterest = (data.apr / 100 / 12) * data.balance;
    return data.monthlyPayment > monthlyInterest;
}, {
    message: "Monthly payment is too low to cover interest. The balance will never be paid off.",
    path: ["monthlyPayment"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  monthsToPayOff: number;
  totalInterest: number;
  totalPayment: number;
};

export default function CreditCardInterestCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: 50000,
      apr: 36,
      monthlyPayment: 2500,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const monthlyRate = data.apr / 100 / 12;
    const numerator = Math.log(data.monthlyPayment / (data.monthlyPayment - data.balance * monthlyRate));
    const denominator = Math.log(1 + monthlyRate);
    
    const months = numerator / denominator;
    
    if (isNaN(months) || !isFinite(months)) {
        // This case is handled by the zod refinement, but as a fallback
        setResult(null);
        return;
    }

    const totalPayment = data.monthlyPayment * months;
    const totalInterest = totalPayment - data.balance;

    setResult({
      monthsToPayOff: Math.ceil(months),
      totalInterest,
      totalPayment,
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
                            <CardTitle className="font-headline text-2xl">Credit Card Payoff Calculator</CardTitle>
                            <CardDescription>Estimate how long it will take to pay off your credit card balance and the total interest you'll pay.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="balance">Outstanding Balance (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The total amount you currently owe on your credit card.</p>
                                    <Input id="balance" type="number" {...register('balance')} />
                                    {errors.balance && <p className="text-destructive text-sm">{errors.balance.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apr">Annual Percentage Rate (APR) (%)</Label>
                                     <p className="text-xs text-muted-foreground">The yearly interest rate charged on your card. This can be as high as 40-48% in India.</p>
                                    <Input id="apr" type="number" step="0.1" {...register('apr')} />
                                    {errors.apr && <p className="text-destructive text-sm">{errors.apr.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyPayment">Fixed Monthly Payment (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The fixed amount you plan to pay each month. Paying more than the minimum due will save you significant interest.</p>
                                    <Input id="monthlyPayment" type="number" {...register('monthlyPayment')} />
                                    {errors.monthlyPayment && <p className="text-destructive text-sm">{errors.monthlyPayment.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate Payoff</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Payoff Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center border-b pb-4">
                                    <p className="text-sm text-muted-foreground">It will take you approximately</p>
                                    <p className="text-3xl font-bold text-primary">{Math.floor(result.monthsToPayOff / 12)} years and {result.monthsToPayOff % 12} months</p>
                                    <p className="text-sm text-muted-foreground">to pay off your balance.</p>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Total Principal Paid:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(form.getValues('balance'))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-destructive font-semibold">Total Interest Paid:</span>
                                        <span className="font-medium text-foreground text-destructive font-semibold">{formatCurrency(result.totalInterest)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Amount Paid:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.totalPayment)}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`I'll pay ${formatCurrency(result.totalInterest)} in interest on my credit card!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Credit Card Interest</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          Credit card interest can be a significant financial burden if not managed correctly. Due to high APRs and daily compounding, balances can grow quickly if you only pay the minimum amount due. This calculator shows how your monthly payments affect the total interest you'll pay and the time it takes to become debt-free.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>How is credit card interest calculated?</AccordionTrigger>
                              <AccordionContent>
                                Credit card interest is typically compounded daily. This means interest is calculated on your closing balance each day and added to the principal. This calculator uses a standard formula to estimate the payoff time based on a fixed monthly payment, which provides a very close approximation of the total cost.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What's the danger of paying only the minimum?</AccordionTrigger>
                              <AccordionContent>
                                Paying only the minimum amount due is the most expensive way to pay off credit card debt. A large portion of the minimum payment goes towards interest, with very little reducing the principal balance. This can extend your repayment period by many years and cause you to pay several times the original amount in interest.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>What are some strategies to pay debt faster?</AccordionTrigger>
                              <AccordionContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Pay more than the minimum:</strong> Always try to pay more than the minimum due. Even a small extra amount can make a big difference.</li>
                                    <li><strong>Debt Avalanche:</strong> Focus on paying off the card with the highest interest rate first, while making minimum payments on others.</li>
                                    <li><strong>Debt Snowball:</strong> Focus on paying off the card with the smallest balance first for a psychological win, then roll that payment into the next smallest balance.</li>
                                    <li><strong>Balance Transfer:</strong> Consider transferring your balance to a card with a lower promotional interest rate. Use our Balance Transfer Calculator to see the potential savings.</li>
                                </ul>
                              </AccordionContent>
                          </AccordionItem>
                      </Accordion>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
