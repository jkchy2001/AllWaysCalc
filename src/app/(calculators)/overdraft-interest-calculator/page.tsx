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
import { Home, TrendingDown } from 'lucide-react';
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
                <CardDescription>Estimate the interest charged on an overdraft facility.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Overdraft Amount (₹)</Label>
                    <Input id="amount" type="number" {...register('amount')} />
                    {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apr">Annual Interest Rate (%)</Label>
                    <Input id="apr" type="number" step="0.01" {...register('apr')} />
                    {errors.apr && <p className="text-destructive text-sm">{errors.apr.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="days">Number of Days Overdrawn</Label>
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
               An overdraft facility allows you to withdraw money from your bank account even if the balance is zero. The bank charges interest on the overdrawn amount. This interest is typically calculated daily.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Interest = Amount × (Annual Rate / 365) × Number of Days
                    </code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
