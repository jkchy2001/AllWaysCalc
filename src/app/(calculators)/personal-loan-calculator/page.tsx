
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

export default function PersonalLoanCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 100000,
      interestRate: 11,
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
                            <CardTitle className="font-headline text-2xl">Personal Loan Calculator</CardTitle>
                            <CardDescription>Estimate your monthly personal loan payments (EMI).</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                                     <p className="text-xs text-muted-foreground">The total amount you wish to borrow.</p>
                                    <Input id="loanAmount" type="number" placeholder="e.g., 100000" {...register('loanAmount')} />
                                    {errors.loanAmount && <p className="text-destructive text-sm">{errors.loanAmount.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
                                     <p className="text-xs text-muted-foreground">The yearly interest rate for the loan.</p>
                                    <Input id="interestRate" type="number" step="0.01" placeholder="e.g., 11" {...register('interestRate')} />
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
                                <CardTitle className="font-headline">Personal Loan Summary</CardTitle>
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
                                <SharePanel resultText={`My estimated monthly personal loan EMI is ${formatCurrency(result.monthlyPayment)}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Your Personal Loan</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This personal loan calculator helps you estimate the Equated Monthly Installment (EMI) for your loan. Just enter the loan amount, interest rate, and tenure to get started.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                              <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-2">
                                      <li><strong>Loan Amount:</strong> The sum of money you borrow.</li>
                                      <li><strong>Interest Rate:</strong> The annual percentage rate charged by the lender. Personal loan rates are typically higher than secured loans like home or car loans.</li>
                                      <li><strong>Loan Term:</strong> The duration over which the loan is to be repaid, usually ranging from 1 to 5 years.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Benefits and Risks of a Personal Loan</AccordionTrigger>
                              <AccordionContent>
                                  <h4 className="font-semibold text-primary">Benefits:</h4>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>No Collateral:</strong> Personal loans are typically unsecured, meaning you don't have to pledge any assets.</li>
                                      <li><strong>Flexibility of Use:</strong> The funds can be used for any purpose, such as a wedding, medical emergency, travel, or debt consolidation.</li>
                                      <li><strong>Quick Disbursal:</strong> The application and approval process is generally faster than for secured loans.</li>
                                  </ul>
                                  <h4 className="font-semibold text-destructive mt-4">Risks:</h4>
                                  <ul className="list-disc pl-5 space-y-1 mt-2">
                                      <li><strong>Higher Interest Rates:</strong> Due to their unsecured nature, personal loans carry higher interest rates.</li>
                                      <li><strong>Impact on Credit Score:</strong> Missing EMI payments can significantly harm your credit score, making future borrowing more difficult.</li>
                                      <li><strong>Debt Trap:</strong> Taking on high-interest debt without a clear repayment plan can lead to a cycle of debt.</li>
                                  </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">What is a personal loan?</h4>
                                    <p>A personal loan is an unsecured loan, meaning it does not require collateral. It can be used for various purposes like a wedding, medical emergency, travel, or home renovation. Interest rates are typically higher than secured loans.</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">How can I improve my chances of getting a personal loan?</h4>
                                    <p>Maintaining a good credit score (CIBIL score), having a stable income, and a low debt-to-income ratio can improve your eligibility for a personal loan and may help you get a better interest rate.</p>
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
                        <Link href="/debt-to-income-ratio-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Debt-to-Income Ratio</p>
                        </Link>
                        <Link href="/credit-card-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Credit Card Interest</p>
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
