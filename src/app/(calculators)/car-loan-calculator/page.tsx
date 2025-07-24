
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Loan EMI Calculator',
  description: 'Estimate your monthly car loan payments (EMI) and total interest cost. Plan your budget for your new vehicle with our easy-to-use calculator.',
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

export default function CarLoanCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 800000,
      interestRate: 9.5,
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
                            <CardTitle className="font-headline text-2xl">Car Loan EMI Calculator</CardTitle>
                            <CardDescription>Estimate your monthly car loan payments (EMI) and total interest cost.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The amount you are borrowing after your down payment.</p>
                                    <Input id="loanAmount" type="number" placeholder="e.g., 800000" {...register('loanAmount')} />
                                    {errors.loanAmount && <p className="text-destructive text-sm">{errors.loanAmount.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                                    <p className="text-xs text-muted-foreground">The yearly interest rate for the loan.</p>
                                    <Input id="interestRate" type="number" step="0.01" placeholder="e.g., 9.5" {...register('interestRate')} />
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
                                <CardTitle className="font-headline">Car Loan Summary</CardTitle>
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
                                <SharePanel resultText={`My estimated monthly car loan EMI is ${formatCurrency(result.monthlyPayment)}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Your Car Loan</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This car loan calculator helps you estimate the Equated Monthly Installment (EMI) for your vehicle loan. Enter the loan amount, interest rate, and tenure to see your potential monthly payment.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                           <AccordionItem value="item-1">
                              <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                              <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Loan Amount:</strong> The total amount you borrow, which should be the car's on-road price minus any down payment you make.</li>
                                      <li><strong>Interest Rate (APR):</strong> The annual percentage rate charged on the loan. A lower APR means lower costs.</li>
                                      <li><strong>Loan Term:</strong> The duration of the loan. A shorter term means higher EMIs but less total interest paid. A longer term means lower EMIs but more total interest paid.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Benefits and Risks of a Car Loan</AccordionTrigger>
                              <AccordionContent>
                                  <h4 className="font-semibold text-primary">Benefits:</h4>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>Immediate Ownership:</strong> Allows you to own and use a car without paying the full price upfront.</li>
                                      <li><strong>Fixed Payments:</strong> EMIs provide a predictable monthly expense, making budgeting easier.</li>
                                      <li><strong>Credit Building:</strong> Timely repayment of a car loan can positively impact your credit score.</li>
                                  </ul>
                                  <h4 className="font-semibold text-destructive mt-4">Risks:</h4>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>Depreciating Asset:</strong> Cars lose value over time. You may owe more on the loan than the car is worth, especially in the early years.</li>
                                      <li><strong>Interest Costs:</strong> You will pay more than the car's sticker price over the life of the loan.</li>
                                      <li><strong>Default Risk:</strong> If you fail to make payments, the lender can repossess the vehicle, and your credit score will be severely damaged.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">What is a down payment?</h4>
                                    <p>A down payment is an initial, upfront partial payment for the purchase of a car. A larger down payment reduces your loan amount, which in turn lowers your monthly EMI and total interest paid.</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Does my credit score affect the interest rate?</h4>
                                    <p>Yes, a higher credit score (like a CIBIL score in India) generally makes you eligible for lower interest rates from lenders, as it indicates a lower risk of default. It's a good idea to check your credit score before applying for a car loan.</p>
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
                        <Link href="/personal-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Personal Loan</p>
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
