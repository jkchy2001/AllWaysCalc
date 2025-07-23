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
  monthlyIncome: z.coerce.number().min(1, 'Monthly income must be positive'),
  monthlyEmi: z.coerce.number().min(0, 'Existing EMI must be a positive number'),
  interestRate: z.coerce.number().min(0, 'Interest rate must be positive'),
  loanTerm: z.coerce.number().int().min(1, 'Loan term must be at least 1 year'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  eligibleLoanAmount: number;
  monthlyEmi: number;
};

export default function LoanEligibilityCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: 50000,
      monthlyEmi: 0,
      interestRate: 8.5,
      loanTerm: 20,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { monthlyIncome, monthlyEmi, interestRate, loanTerm } = data;
    
    // Assuming FOIR is 50%
    const foir = 0.50; 
    const maxEmiPossible = (monthlyIncome * foir) - monthlyEmi;

    if (maxEmiPossible <= 0) {
        setResult({ eligibleLoanAmount: 0, monthlyEmi: 0 });
        return;
    }

    const r = (interestRate / 100) / 12; // monthly interest rate
    const n = loanTerm * 12; // number of months
    
    const eligibleLoanAmount = (maxEmiPossible / r) * (1 - (1 / Math.pow(1 + r, n)));

    setResult({
      eligibleLoanAmount,
      monthlyEmi: maxEmiPossible,
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
                            <CardTitle className="font-headline text-2xl">Loan Eligibility Calculator</CardTitle>
                            <CardDescription>Estimate the maximum loan amount you may be eligible for.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyIncome">Net Monthly Income (₹)</Label>
                                    <Input id="monthlyIncome" type="number" {...register('monthlyIncome')} />
                                    {errors.monthlyIncome && <p className="text-destructive text-sm">{errors.monthlyIncome.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyEmi">Total Current Monthly EMIs (₹)</Label>
                                    <Input id="monthlyEmi" type="number" {...register('monthlyEmi')} />
                                    {errors.monthlyEmi && <p className="text-destructive text-sm">{errors.monthlyEmi.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Expected Annual Interest Rate (%)</Label>
                                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
                                    {errors.interestRate && <p className="text-destructive text-sm">{errors.interestRate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                                    <Input id="loanTerm" type="number" {...register('loanTerm')} />
                                    {errors.loanTerm && <p className="text-destructive text-sm">{errors.loanTerm.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Eligibility</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Loan Eligibility Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <span className='font-bold'>Eligible Loan Amount:</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.eligibleLoanAmount)}</span>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Eligible Monthly EMI:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.monthlyEmi)}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`I may be eligible for a loan of ${formatCurrency(result.eligibleLoanAmount)}!`} />
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
                          This calculator estimates your loan eligibility based on your income and existing financial obligations. Lenders typically use a metric called the Fixed Obligation to Income Ratio (FOIR) to determine your repayment capacity.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <p>The calculation is a multi-step process:</p>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              1. Max EMI = (Monthly Income * FOIR) - Existing EMIs<br/>
                              2. Loan Amount = [Max EMI / r] * [1 - (1 / (1+r)^n)]<br/><br/>
                              <b>r</b> = Monthly Interest Rate<br/>
                              <b>n</b> = Loan Term in Months
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What is FOIR?</AccordionTrigger>
                              <AccordionContent>
                              Fixed Obligation to Income Ratio (FOIR) is the percentage of your income that goes towards fixed obligations like EMIs. Lenders usually prefer this to be around 40-50%. Our calculator assumes a 50% FOIR.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Is this amount guaranteed?</AccordionTrigger>
                              <AccordionContent>
                              No, this is only an estimate. The actual loan amount depends on the lender's policies, your credit score, employment history, and other factors.
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
