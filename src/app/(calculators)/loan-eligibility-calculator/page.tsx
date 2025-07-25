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
                            <CardTitle className="font-headline text-2xl">Loan Eligibility Calculator</CardTitle>
                            <CardDescription>Estimate the maximum loan amount you may be eligible for.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyIncome">Net Monthly Income (₹)</Label>
                                    <p className="text-xs text-muted-foreground">Your take-home salary per month.</p>
                                    <Input id="monthlyIncome" type="number" {...register('monthlyIncome')} />
                                    {errors.monthlyIncome && <p className="text-destructive text-sm">{errors.monthlyIncome.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="monthlyEmi">Total Current Monthly EMIs (₹)</Label>
                                    <p className="text-xs text-muted-foreground">Sum of all existing loan EMIs you pay each month.</p>
                                    <Input id="monthlyEmi" type="number" {...register('monthlyEmi')} />
                                    {errors.monthlyEmi && <p className="text-destructive text-sm">{errors.monthlyEmi.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Expected Annual Interest Rate (%)</Label>
                                     <p className="text-xs text-muted-foreground">The likely interest rate for the new loan.</p>
                                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
                                    {errors.interestRate && <p className="text-destructive text-sm">{errors.interestRate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                                     <p className="text-xs text-muted-foreground">The desired tenure for the new loan.</p>
                                    <Input id="loanTerm" type="number" {...register('loanTerm')} />
                                    {errors.loanTerm && <p className="text-destructive text-sm">{errors.loanTerm.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate Eligibility</Button>
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
                      <CardTitle className="font-headline">How Loan Eligibility is Determined</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This calculator estimates your loan eligibility based on your income and existing financial obligations. Lenders typically use a metric called the Fixed Obligation to Income Ratio (FOIR) to determine your repayment capacity.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                           <AccordionItem value="item-1">
                              <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                              <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Net Monthly Income:</strong> Your in-hand salary after all deductions like PF, professional tax, etc.</li>
                                      <li><strong>Current EMIs:</strong> The total of all monthly payments you are currently making for other loans.</li>
                                      <li><strong>FOIR (Fixed Obligation to Income Ratio):</strong> The percentage of your income that goes towards fixed obligations like EMIs. Lenders use this to assess how much more debt you can handle. This calculator assumes a standard FOIR of 50%.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>How can I improve my eligibility?</AccordionTrigger>
                              <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li><strong>Increase Income:</strong> A higher income directly increases your repayment capacity.</li>
                                    <li><strong>Reduce Existing Debt:</strong> Paying off existing loans frees up your income and lowers your FOIR.</li>
                                    <li><strong>Improve Credit Score:</strong> A high credit score signals to lenders that you are a responsible borrower, often leading to better terms and higher eligibility.</li>
                                    <li><strong>Opt for a Longer Tenure:</strong> A longer loan term reduces the monthly EMI, which can help you fit a larger loan amount into your budget, although you will pay more interest over time.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>Is this amount guaranteed?</AccordionTrigger>
                              <AccordionContent>
                              No, this is only an estimate based on common lending criteria. The actual loan amount you are offered depends entirely on the lender's policies, your credit score, employment history, and other individual factors. This tool should be used for guidance only.
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
                        <Link href="/loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Loan / EMI Calculator</p>
                        </Link>
                        <Link href="/debt-to-income-ratio-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Debt-to-Income Ratio</p>
                        </Link>
                        <Link href="/home-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Home Loan Calculator</p>
                        </Link>
                         <Link href="/credit-card-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Credit Card Interest</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
