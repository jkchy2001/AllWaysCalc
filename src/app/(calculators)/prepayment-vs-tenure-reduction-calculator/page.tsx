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
import { Home, FileMinus, Shuffle, CalendarClock, CreditCard } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  loanAmount: z.coerce.number().min(1, 'Loan amount must be positive'),
  prepaymentAmount: z.coerce.number().min(1, 'Prepayment must be positive'),
  interestRate: z.coerce.number().min(0, 'Interest rate must be positive'),
  loanTerm: z.coerce.number().int().min(1, 'Loan term must be at least 1 year'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  originalEmi: number;
  originalTotalInterest: number;
  emiReduction: {
    newEmi: number;
    interestSaved: number;
  };
  tenureReduction: {
    newTenureMonths: number;
    interestSaved: number;
  };
};

export default function PrepaymentCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 5000000,
      prepaymentAmount: 500000,
      interestRate: 8.5,
      loanTerm: 20,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const calculateEmi = (p: number, r: number, n: number) => {
    if (p <= 0 || r <= 0 || n <= 0) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };
  
  const calculateTotalInterest = (emi: number, n: number, p: number) => {
    return (emi * n) - p;
  };

  const onSubmit = (data: FormValues) => {
    const { loanAmount, interestRate, loanTerm, prepaymentAmount } = data;
    const r = interestRate / 100 / 12;
    const n = loanTerm * 12;

    const originalEmi = calculateEmi(loanAmount, r, n);
    const originalTotalInterest = calculateTotalInterest(originalEmi, n, loanAmount);

    const newLoanAmount = loanAmount - prepaymentAmount;

    // Scenario 1: EMI Reduction
    const newEmi = calculateEmi(newLoanAmount, r, n);
    const emiReductionInterestSaved = originalTotalInterest - calculateTotalInterest(newEmi, n, newLoanAmount);

    // Scenario 2: Tenure Reduction
    const newN = Math.log(originalEmi / (originalEmi - newLoanAmount * r)) / Math.log(1 + r);
    const tenureReductionInterestSaved = originalTotalInterest - calculateTotalInterest(originalEmi, newN, newLoanAmount);

    setResult({
      originalEmi,
      originalTotalInterest,
      emiReduction: {
        newEmi,
        interestSaved: emiReductionInterestSaved,
      },
      tenureReduction: {
        newTenureMonths: Math.ceil(newN),
        interestSaved: tenureReductionInterestSaved,
      },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };
  
  const formatMonthsToYears = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years}y ${remainingMonths}m`;
  }

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
                <div className="grid gap-8 lg:grid-cols-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Loan Prepayment: EMI vs. Tenure Reduction</CardTitle>
                            <CardDescription>Compare the benefits of reducing your EMI versus shortening your loan term after making a part-payment.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Outstanding Loan Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The principal amount you still owe.</p>
                                    <Input id="loanAmount" type="number" {...register('loanAmount')} />
                                    {errors.loanAmount && <p className="text-destructive text-sm">{errors.loanAmount.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                                    <p className="text-xs text-muted-foreground">The annual interest rate on your loan.</p>
                                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
                                    {errors.interestRate && <p className="text-destructive text-sm">{errors.interestRate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loanTerm">Remaining Term (Years)</Label>
                                    <p className="text-xs text-muted-foreground">The number of years left on your loan.</p>
                                    <Input id="loanTerm" type="number" {...register('loanTerm')} />
                                    {errors.loanTerm && <p className="text-destructive text-sm">{errors.loanTerm.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prepaymentAmount">Prepayment Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The lump sum amount you wish to pay.</p>
                                    <Input id="prepaymentAmount" type="number" {...register('prepaymentAmount')} />
                                    {errors.prepaymentAmount && <p className="text-destructive text-sm">{errors.prepaymentAmount.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Compare Options</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Prepayment Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Parameter</TableHead>
                                            <TableHead className="text-center">Reduce EMI</TableHead>
                                            <TableHead className="text-center">Reduce Tenure</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">New EMI</TableCell>
                                            <TableCell className="text-center font-bold text-primary">{formatCurrency(result.emiReduction.newEmi)}</TableCell>
                                            <TableCell className="text-center">{formatCurrency(result.originalEmi)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">New Tenure</TableCell>
                                            <TableCell className="text-center">{form.getValues('loanTerm')} years</TableCell>
                                            <TableCell className="text-center font-bold text-primary">{formatMonthsToYears(result.tenureReduction.newTenureMonths)}</TableCell>
                                        </TableRow>
                                         <TableRow>
                                            <TableCell className="font-medium">Total Interest Saved</TableCell>
                                            <TableCell className="text-center text-green-600">{formatCurrency(result.emiReduction.interestSaved)}</TableCell>
                                            <TableCell className="text-center text-green-600 font-bold">{formatCurrency(result.tenureReduction.interestSaved)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                             <CardFooter>
                                <p className="text-sm text-muted-foreground">Reducing the tenure almost always results in greater total interest savings compared to reducing the EMI.</p>
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="font-headline">Understanding Loan Prepayment Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            When you make a lump sum prepayment towards your loan, lenders typically offer two options: you can either reduce your monthly EMI while keeping the loan tenure the same, or keep your EMI the same and reduce the loan tenure. This calculator helps you understand the financial impact of each choice.
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Benefits of Reducing EMI</AccordionTrigger>
                                <AccordionContent>
                                    Choosing to reduce your EMI provides immediate relief to your monthly budget. Your monthly cash outflow decreases, which can free up funds for other expenses or investments. This is a good option if your primary goal is to improve your current cash flow.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Benefits of Reducing Tenure</AccordionTrigger>
                                <AccordionContent>
                                    Choosing to reduce the loan tenure is the more financially savvy option for long-term savings. By paying off the loan faster, you significantly reduce the total amount of interest you pay to the bank over the life of the loan. This is the best option if you can comfortably afford the current EMI and want to become debt-free sooner while saving the most money.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>Which option is better?</AccordionTrigger>
                                <AccordionContent>
                                    From a purely financial perspective, **reducing the tenure is almost always better** as it results in the highest interest savings. However, the "best" option depends on your personal financial situation. If you need more liquidity in your monthly budget, reducing the EMI might be the right choice for you.
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
                         <Link href="/balance-transfer-benefit-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                           <Shuffle className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Balance Transfer Benefit</p>
                        </Link>
                        <Link href="/emi-in-arrears-vs-advance-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <CalendarClock className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">EMI in Arrears vs Advance</p>
                        </Link>
                        <Link href="/credit-card-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <CreditCard className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Credit Card Interest</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
