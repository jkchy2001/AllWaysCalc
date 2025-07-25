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
import { Home, TrendingDown, CreditCard, WalletCards } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  amount: z.coerce.number().min(1, 'Overdraft amount must be positive.'),
  apr: z.coerce.number().min(0, 'Interest rate must be positive.'),
  days: z.coerce.number().int().min(1, 'Must be overdrawn for at least one day.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalInterest: number;
};

export default function OverdraftInterestCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 50000,
      apr: 18,
      days: 30,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const dailyRate = data.apr / 100 / 365;
    const totalInterest = data.amount * dailyRate * data.days;
    
    setResult({
      totalInterest
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
                <CardTitle className="font-headline text-2xl">Overdraft Interest Calculator</CardTitle>
                <CardDescription>Estimate the interest charged on an overdraft facility based on the amount, interest rate, and duration.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Overdraft Amount (₹)</Label>
                     <p className="text-xs text-muted-foreground">The amount of money utilized from the overdraft facility.</p>
                    <Input id="amount" type="number" {...register('amount')} />
                    {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apr">Annual Interest Rate (%)</Label>
                    <p className="text-xs text-muted-foreground">The annual percentage rate (APR) for the overdraft.</p>
                    <Input id="apr" type="number" step="0.01" {...register('apr')} />
                    {errors.apr && <p className="text-destructive text-sm">{errors.apr.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="days">Number of Days Overdrawn</Label>
                    <p className="text-xs text-muted-foreground">The duration for which the amount was overdrawn.</p>
                    <Input id="days" type="number" {...register('days')} />
                    {errors.days && <p className="text-destructive text-sm">{errors.days.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Interest</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Interest Calculation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">Estimated Interest Charged:</p>
                    <div className="text-4xl font-bold text-primary">{formatCurrency(result.totalInterest)}</div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The estimated overdraft interest is ${formatCurrency(result.totalInterest)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Overdraft Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               An overdraft facility allows you to withdraw money from your current or savings account even if the balance is zero, up to a pre-approved limit. The bank charges interest on the overdrawn amount, and this interest is typically calculated on a daily basis.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How is Overdraft Interest Calculated?</AccordionTrigger>
                  <AccordionContent>
                      The calculation is straightforward simple interest, but applied daily.
                       <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                          Daily Interest = Amount × (Annual Rate / 365)
                          <br/>
                          Total Interest = Daily Interest × Number of Days
                        </code>
                      </pre>
                      This calculator provides an estimate based on this formula.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Benefits and Risks of an Overdraft</AccordionTrigger>
                  <AccordionContent>
                    <h4 className="font-semibold text-primary">Benefits:</h4>
                    <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                        <li><strong>Flexibility:</strong> Provides immediate access to funds for short-term cash flow gaps or emergencies without needing to apply for a new loan.</li>
                        <li><strong>Interest on Utilized Amount Only:</strong> You only pay interest on the amount you actually use from the overdraft limit, not the entire sanctioned limit.</li>
                    </ul>
                    <h4 className="font-semibold text-destructive">Risks:</h4>
                     <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li><strong>High Interest Rates:</strong> Overdraft interest rates are often higher than those for conventional loans.</li>
                        <li><strong>Potential for Debt:</strong> If not managed carefully, an overdraft can become a persistent debt that is difficult to clear.</li>
                        <li><strong>Fees:</strong> Some banks may charge annual fees or processing charges for the facility.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it different from a credit card?</AccordionTrigger>
                  <AccordionContent>
                    Yes. While both provide a line of credit, overdrafts are linked directly to your bank account. Credit cards are a separate instrument. Interest rates and fee structures can also differ significantly. Overdrafts are often used by businesses for working capital, while credit cards are more common for personal or business purchases.
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
              <Link href="/credit-card-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <CreditCard className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Credit Card Interest</p>
              </Link>
              <Link href="/loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <WalletCards className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Loan / EMI Calculator</p>
              </Link>
              <Link href="/simple-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Simple Interest</p>
              </Link>
               <Link href="/business-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Business Loan</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
