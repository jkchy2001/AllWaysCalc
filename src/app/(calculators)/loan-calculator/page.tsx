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

export default function LoanCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      interestRate: 8.5,
      loanTerm: 20,
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
                            <CardTitle className="font-headline text-2xl">Loan / EMI Calculator</CardTitle>
                            <CardDescription>Estimate your monthly loan payments (EMI) for any type of loan.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The total amount of money you are borrowing.</p>
                                    <Input id="loanAmount" type="number" placeholder="e.g., 5000000" {...register('loanAmount')} />
                                    {errors.loanAmount && <p className="text-destructive text-sm">{errors.loanAmount.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                                     <p className="text-xs text-muted-foreground">The annual rate of interest on the loan.</p>
                                    <Input id="interestRate" type="number" step="0.01" placeholder="e.g., 8.5" {...register('interestRate')} />
                                    {errors.interestRate && <p className="text-destructive text-sm">{errors.interestRate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                                    <p className="text-xs text-muted-foreground">The duration over which you will repay the loan.</p>
                                    <Input id="loanTerm" type="number" placeholder="e.g., 20" {...register('loanTerm')} />
                                    {errors.loanTerm && <p className="text-destructive text-sm">{errors.loanTerm.message}</p>}
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
                                <CardTitle className="font-headline">Loan Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <span className='font-bold'>Monthly Payment (EMI):</span>
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
                                        <span>Total Payment:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.totalPayment)}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My estimated monthly loan payment is ${formatCurrency(result.monthlyPayment)}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How Loan EMIs Work</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This loan calculator helps you estimate the monthly payments (Equated Monthly Installment or EMI) for any type of loan. It's suitable for mortgages, auto loans, or personal loans. By understanding your potential EMI, you can better plan your budget and financial commitments.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                           <AccordionItem value="item-1">
                              <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                              <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Principal:</strong> The original amount of money borrowed.</li>
                                      <li><strong>Interest Rate:</strong> The cost of borrowing the principal amount, expressed as an annual percentage.</li>
                                      <li><strong>Term / Tenure:</strong> The total time period for which the loan is taken.</li>
                                      <li><strong>EMI:</strong> A fixed payment made by the borrower to the lender every month. It consists of both a principal component and an interest component. In the initial years, the interest component is larger, and it gradually decreases as the principal gets paid down.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Understanding Amortization</AccordionTrigger>
                              <AccordionContent>
                              Amortization is the process of spreading out a loan into a series of fixed payments over time. A portion of each payment goes toward the loan's principal and the rest toward interest. While your EMI is fixed, the proportion of principal and interest changes with each payment. Initially, you pay more towards interest, and as you proceed, a larger portion goes towards paying off the principal.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>FAQs</AccordionTrigger>
                              <AccordionContent>
                                <div>
                                    <h4 className="font-semibold">How can I reduce my EMI?</h4>
                                    <p>You can reduce your EMI by opting for a longer loan tenure. However, be aware that a longer tenure means you will pay more in total interest over the life of the loan.</p>
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-semibold">Does this calculator include taxes or other fees?</h4>
                                    <p>No, this calculator only computes the principal and interest portion of your payment. For mortgages, your total payment (often called PITI) will also include property taxes and homeowner's insurance. For other loans, there might be processing fees or other charges not included here.</p>
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
                        <Link href="/home-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Home Loan Calculator</p>
                        </Link>
                        <Link href="/personal-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Personal Loan</p>
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
