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

export default function HomeLoanCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 5000000,
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
                            <CardTitle className="font-headline text-2xl">Home Loan Calculator</CardTitle>
                            <CardDescription>Estimate your monthly home loan payments (EMI).</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The amount you are borrowing after your down payment.</p>
                                    <Input id="loanAmount" type="number" placeholder="e.g., 5000000" {...register('loanAmount')} />
                                    {errors.loanAmount && <p className="text-destructive text-sm">{errors.loanAmount.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                                    <p className="text-xs text-muted-foreground">The yearly interest rate for the loan.</p>
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
                                <Button type="submit" className="w-full">Calculate EMI</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Home Loan Summary</CardTitle>
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
                                <SharePanel resultText={`My estimated monthly home loan EMI is ${formatCurrency(result.monthlyPayment)}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Your Home Loan</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This home loan calculator helps you estimate the Equated Monthly Installment (EMI) for your housing loan. Just enter the loan amount, interest rate, and tenure to get started. Understanding these numbers is the first step towards homeownership.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                           <AccordionItem value="item-1">
                              <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                              <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Loan Amount:</strong> The total amount borrowed from the bank or financial institution. This does not include the down payment, which is the initial amount you pay from your own funds.</li>
                                      <li><strong>Interest Rate:</strong> The rate at which the bank charges you for borrowing the money. Home loan rates can be fixed or floating.</li>
                                      <li><strong>Loan Term (Tenure):</strong> The period over which you agree to repay the loan. Longer tenures mean lower EMIs but higher total interest paid, and vice versa.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Benefits and Risks of a Home Loan</AccordionTrigger>
                              <AccordionContent>
                                  <h4 className="font-semibold text-primary">Benefits:</h4>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>Asset Creation:</strong> Allows you to purchase a valuable asset that can appreciate over time.</li>
                                      <li><strong>Tax Benefits:</strong> You can claim tax deductions on both the principal and interest components of your home loan under different sections of the Income Tax Act.</li>
                                      <li><strong>Forced Savings:</strong> The discipline of paying a monthly EMI instills a habit of regular savings.</li>
                                  </ul>
                                  <h4 className="font-semibold text-destructive mt-4">Risks:</h4>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>Long-Term Commitment:</strong> A home loan is a significant financial commitment that can last for 20-30 years.</li>
                                      <li><strong>Interest Rate Fluctuations:</strong> If you have a floating rate loan, your EMI can increase if market rates go up.</li>
                                      <li><strong>Default Consequences:</strong> Failure to pay EMIs can lead to the lender taking possession of your property and severely damaging your credit score.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">What other costs are involved in a home loan?</h4>
                                    <p>Besides the EMI, you should also consider other charges like processing fees, legal fees, stamp duty, and registration charges. This calculator only covers the principal and interest components of the loan.</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Can I make prepayments on my home loan?</h4>
                                    <p>Yes, most banks allow you to make partial or full prepayments on your home loan. This can significantly reduce your total interest outgo and shorten the loan tenure. It's best to check with your lender about any prepayment charges.</p>
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
                        <Link href="/personal-loan-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Personal Loan</p>
                        </Link>
                         <Link href="/loan-eligibility-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Loan Eligibility</p>
                        </Link>
                         <Link href="/mortgage-refinance-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Mortgage Refinance</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
