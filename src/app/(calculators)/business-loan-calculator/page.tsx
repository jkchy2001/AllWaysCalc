
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Loan EMI Calculator',
  description: 'Estimate your monthly business loan payments (EMI) and total interest cost. Plan your finances for working capital, expansion, or equipment purchases.',
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
import { Home } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  loanAmount: z.coerce.number().min(1, 'Loan amount must be positive'),
  interestRate: z.coerce.number().min(0, 'Interest rate must be positive').max(100, 'Interest rate seems high'),
  loanTerm: z.coerce.number().int().min(1, 'Loan term must be at least 1 year'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
};

export default function BusinessLoanCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 1000000,
      interestRate: 14,
      loanTerm: 5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const principal = data.loanAmount;
    const monthlyInterestRate = (data.interestRate / 100) / 12;
    const numberOfPayments = data.loanTerm * 12;

    const monthlyPayment = principal * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount: principal,
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
                            <CardTitle className="font-headline text-2xl">Business Loan EMI Calculator</CardTitle>
                            <CardDescription>Estimate your monthly business loan payments (EMI) to plan your finances effectively.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The total amount of the loan you wish to take.</p>
                                    <Input id="loanAmount" type="number" placeholder="e.g., 1000000" {...register('loanAmount')} />
                                    {errors.loanAmount && <p className="text-destructive text-sm">{errors.loanAmount.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                                    <p className="text-xs text-muted-foreground">The yearly interest rate offered by the lender.</p>
                                    <Input id="interestRate" type="number" step="0.01" placeholder="e.g., 14" {...register('interestRate')} />
                                    {errors.interestRate && <p className="text-destructive text-sm">{errors.interestRate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                                    <p className="text-xs text-muted-foreground">The duration over which you will repay the loan.</p>
                                    <Input id="loanTerm" type="number" placeholder="e.g., 5" {...register('loanTerm')} />
                                    {errors.loanTerm && <p className="text-destructive text-sm">{errors.loanTerm.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate EMI</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Business Loan Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <span className='font-bold'>Monthly EMI:</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</span>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Principal Amount:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.loanAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Interest Paid:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Payment (Principal + Interest):</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.totalPayment)}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My estimated monthly business loan EMI is ${formatCurrency(result.monthlyPayment)}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Your Business Loan</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This calculator helps you estimate the Equated Monthly Installment (EMI) for a business loan, which can be used for working capital, expansion, or purchasing equipment. Understanding your EMI is the first step in managing your business's financial obligations.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                           <AccordionItem value="item-1">
                              <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                              <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Loan Amount (Principal):</strong> The initial sum of money you borrow from the lender.</li>
                                      <li><strong>Interest Rate:</strong> The percentage charged by the lender for the use of their money, expressed annually.</li>
                                      <li><strong>Loan Term:</strong> The total duration over which the loan must be repaid.</li>
                                      <li><strong>EMI (Equated Monthly Installment):</strong> The fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is paid off in full.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-2">
                              <AccordionTrigger>Benefits and Risks of a Business Loan</AccordionTrigger>
                              <AccordionContent>
                                  <h4 className="font-semibold text-primary">Benefits:</h4>
                                   <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>Growth Capital:</strong> Provides necessary funds for expansion, new equipment, or inventory.</li>
                                      <li><strong>Working Capital:</strong> Helps manage day-to-day operational expenses and cash flow gaps.</li>
                                      <li><strong>Flexibility:</strong> Can be used for a variety of business purposes without diluting ownership.</li>
                                  </ul>
                                  <h4 className="font-semibold text-destructive mt-4">Risks:</h4>
                                   <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>Debt Obligation:</strong> Creates a fixed monthly expense (EMI) that must be met regardless of business revenue.</li>
                                      <li><strong>Interest Cost:</strong> The total amount repaid is significantly more than the amount borrowed.</li>
                                      <li><strong>Collateral Risk:</strong> For secured loans, you risk losing the pledged asset if you default on payments.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">What documents are typically required for a business loan?</h4>
                                    <p>Lenders usually require documents like business registration proof, financial statements (balance sheet, profit & loss statement) for the last 2-3 years, income tax returns, and bank statements.</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">What is the difference between a secured and unsecured business loan?</h4>
                                    <p>A secured loan requires you to pledge collateral (like property or equipment), which typically results in a lower interest rate. An unsecured loan does not require collateral but often comes with a higher interest rate due to the increased risk for the lender.</p>
                                  </div>
                                   <div>
                                    <h4 className="font-semibold">What other costs should I consider?</h4>
                                    <p>Besides the interest, be aware of other potential costs like processing fees, pre-payment penalties, and late payment charges. Always read the loan agreement carefully.</p>
                                  </div>
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
                        <Link href="/home-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Home Loan Calculator</p>
                        </Link>
                        <Link href="/car-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Car Loan Calculator</p>
                        </Link>
                         <Link href="/loan-eligibility-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Loan Eligibility</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
