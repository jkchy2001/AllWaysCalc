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
  monthlyIncome: z.coerce.number().min(1, 'Gross monthly income must be positive.'),
  monthlyDebt: z.coerce.number().min(0, 'Monthly debt payments must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  dtiRatio: number;
  category: string;
};

export default function DebtToIncomeRatioCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: 60000,
      monthlyDebt: 15000,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const getDtiCategory = (ratio: number): string => {
    if (ratio <= 35) return 'Looking Good';
    if (ratio > 35 && ratio <= 43) return 'Opportunity to Improve';
    if (ratio > 43 && ratio <= 49) return 'Cause for Concern';
    return 'Dangerous';
  };

  const onSubmit = (data: FormValues) => {
    const { monthlyIncome, monthlyDebt } = data;
    const dtiRatio = (monthlyDebt / monthlyIncome) * 100;
    
    setResult({
      dtiRatio,
      category: getDtiCategory(dtiRatio)
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
                <CardTitle className="font-headline text-2xl">Debt-to-Income (DTI) Ratio Calculator</CardTitle>
                <CardDescription>Assess your financial health by calculating your DTI ratio.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Gross Monthly Income (₹)</Label>
                    <p className="text-xs text-muted-foreground">Your total monthly income before any taxes or deductions.</p>
                    <Input id="monthlyIncome" type="number" {...register('monthlyIncome')} />
                    {errors.monthlyIncome && <p className="text-destructive text-sm">{errors.monthlyIncome.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyDebt">Total Monthly Debt Payments (₹)</Label>
                    <p className="text-xs text-muted-foreground">The sum of all your monthly debt payments (e.g., loan EMIs, credit card minimums).</p>
                    <Input id="monthlyDebt" type="number" {...register('monthlyDebt')} />
                    {errors.monthlyDebt && <p className="text-destructive text-sm">{errors.monthlyDebt.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate DTI</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your DTI Ratio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="text-4xl font-bold text-primary">{result.dtiRatio.toFixed(2)}%</div>
                     <div className="text-lg font-semibold">{result.category}</div>
                    <p className="text-muted-foreground text-sm">A lower DTI ratio indicates good financial health.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My Debt-to-Income ratio is ${result.dtiRatio.toFixed(2)}%.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding DTI Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Your debt-to-income (DTI) ratio is the percentage of your gross monthly income that goes to paying your monthly debt payments. Lenders use it to measure your ability to manage monthly payments and repay debts. It's a key indicator of your financial health.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Why is DTI Important?</AccordionTrigger>
                  <AccordionContent>
                    Lenders view a low DTI as a good sign that you have a healthy balance between debt and income, making you a less risky borrower. A high DTI can make it difficult to qualify for new loans or get favorable interest rates. Monitoring your DTI helps you manage your debt and make informed financial decisions.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                  <AccordionTrigger>What's a good DTI ratio?</AccordionTrigger>
                  <AccordionContent>
                    While there's no single "magic" number, here are some general guidelines lenders often use:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>35% or less:</strong> Looking Good. Your debt is at a manageable level and you likely have money left over after paying your bills.</li>
                      <li><strong>36% to 43%:</strong> Opportunity to Improve. While you'll still likely qualify for loans, reducing your DTI could lead to better terms.</li>
                      <li><strong>44% to 49%:</strong> Cause for Concern. Lenders may see you as a higher-risk borrower.</li>
                      <li><strong>50% or more:</strong> Dangerous. It may be very difficult to qualify for new credit.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How can I lower my DTI?</AccordionTrigger>
                  <AccordionContent>
                    There are two primary ways to lower your DTI ratio:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Reduce Your Monthly Debt:</strong> Focus on paying down existing loans, especially those with high interest rates. Avoid taking on new debt if you're trying to lower your DTI.</li>
                      <li><strong>Increase Your Monthly Income:</strong> Look for opportunities to increase your income, whether through a raise, a side hustle, or other means.</li>
                    </ul>
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
              <Link href="/loan-eligibility-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Loan Eligibility</p>
              </Link>
              <Link href="/credit-card-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Credit Card Interest</p>
              </Link>
              <Link href="/loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Loan / EMI Calculator</p>
              </Link>
              <Link href="/retirement-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Retirement Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
