
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
                <CardTitle className="font-headline text-2xl">Debt-to-Income (DTI) Ratio Calculator</CardTitle>
                <CardDescription>Assess your financial health by calculating your DTI ratio.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Gross Monthly Income (₹)</Label>
                    <Input id="monthlyIncome" type="number" {...register('monthlyIncome')} />
                    {errors.monthlyIncome && <p className="text-destructive text-sm">{errors.monthlyIncome.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyDebt">Total Monthly Debt Payments (₹)</Label>
                    <Input id="monthlyDebt" type="number" {...register('monthlyDebt')} />
                    {errors.monthlyDebt && <p className="text-destructive text-sm">{errors.monthlyDebt.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate DTI</Button>
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
               Your debt-to-income (DTI) ratio is the percentage of your gross monthly income that goes to paying your monthly debt payments. Lenders use it to measure your ability to manage monthly payments and repay debts.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      DTI = (Total Monthly Debt / Gross Monthly Income) * 100
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is considered a good DTI ratio?</AccordionTrigger>
                      <AccordionContent>
                       Most lenders prefer a DTI ratio of 43% or less when you're applying for a mortgage. A ratio of 35% or less is generally considered good, showing you have manageable debt and room in your budget.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>How can I lower my DTI ratio?</AccordionTrigger>
                      <AccordionContent>
                       You can lower your DTI by either reducing your monthly debt (by paying off loans) or increasing your monthly income. Avoid taking on new debt if you're trying to lower your DTI.
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
