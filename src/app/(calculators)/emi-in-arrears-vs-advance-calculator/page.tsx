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
import { Home, CalendarClock, Shuffle, FileMinus } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  loanAmount: z.coerce.number().min(1, 'Loan amount must be positive'),
  interestRate: z.coerce.number().min(0, 'Rate must be positive'),
  loanTerm: z.coerce.number().int().min(1, 'Tenure must be at least 1 year'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    emiArrears: number;
    emiAdvance: number;
    totalInterestArrears: number;
    totalInterestAdvance: number;
    interestSaved: number;
};

export default function EmiTimingCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: 1000000,
      interestRate: 10,
      loanTerm: 5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const p = data.loanAmount;
    const r = data.interestRate / 100 / 12;
    const n = data.loanTerm * 12;

    const emiArrears = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaymentArrears = emiArrears * n;
    const totalInterestArrears = totalPaymentArrears - p;

    const emiAdvance = emiArrears / (1 + r);
    const totalPaymentAdvance = emiAdvance * n;
    const totalInterestAdvance = totalPaymentAdvance - p;

    const interestSaved = totalInterestArrears - totalInterestAdvance;

    setResult({
      emiArrears,
      emiAdvance,
      totalInterestArrears,
      totalInterestAdvance,
      interestSaved,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
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
                <div className="grid gap-8 lg:grid-cols-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">EMI in Arrears vs. Advance Calculator</CardTitle>
                            <CardDescription>See the interest savings by paying your EMI at the start of the month (advance) versus the end of the month (arrears).</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The total amount borrowed.</p>
                                    <Input id="loanAmount" type="number" {...register('loanAmount')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                                    <p className="text-xs text-muted-foreground">The annual interest rate.</p>
                                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                                    <p className="text-xs text-muted-foreground">The duration of the loan.</p>
                                    <Input id="loanTerm" type="number" {...register('loanTerm')} />
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
                                <CardTitle className="font-headline">Comparison Result</CardTitle>
                                <CardDescription className="text-center">By paying your EMI in advance, you could save <span className="font-bold text-primary">{formatCurrency(result.interestSaved)}</span> in total interest over the loan's lifetime.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Parameter</TableHead>
                                            <TableHead className="text-center">EMI in Arrears (End of Month)</TableHead>
                                            <TableHead className="text-center">EMI in Advance (Start of Month)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Monthly EMI</TableCell>
                                            <TableCell className="text-center">{formatCurrency(result.emiArrears)}</TableCell>
                                            <TableCell className="text-center font-bold text-primary">{formatCurrency(result.emiAdvance)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Total Interest Paid</TableCell>
                                            <TableCell className="text-center">{formatCurrency(result.totalInterestArrears)}</TableCell>
                                            <TableCell className="text-center font-bold text-primary">{formatCurrency(result.totalInterestAdvance)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="font-headline">Understanding EMI Timing</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="mb-4">
                        The timing of your Equated Monthly Installment (EMI) payment—whether at the beginning or end of the month—might seem like a small detail, but it has a real impact on the total interest you pay over the life of a loan. This calculator quantifies that difference.
                       </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>What is the difference between "Arrears" and "Advance"?</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>EMI in Arrears:</strong> This is the most common method, where the EMI is due at the end of each payment cycle (e.g., at the end of the month). Interest accrues for the full period before the payment is made.</li>
                                        <li><strong>EMI in Advance:</strong> This is when the EMI is due at the beginning of each payment cycle. Because you are paying down the principal slightly earlier each month, less interest accrues over the loan's tenure.</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Why is there a difference in the EMI amount and total interest?</AccordionTrigger>
                                <AccordionContent>
                                    When you pay in advance, you reduce the principal balance sooner. The interest for each subsequent month is calculated on this slightly lower balance. While the monthly difference is small, this effect compounds over many years, leading to a lower total interest payment. Consequently, the EMI itself can be slightly lower for the same loan amount and tenure.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>Can I choose to pay my EMI in advance?</AccordionTrigger>
                                <AccordionContent>
                                    Most standard loan agreements are structured for EMIs in arrears. However, some lenders may offer flexible options, or you can achieve a similar effect by making a small, voluntary prepayment at the beginning of each month alongside your regular EMI. Always check your loan agreement and consult with your lender.
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
                        <Link href="/prepayment-vs-tenure-reduction-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                             <FileMinus className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Prepayment vs Tenure Reduction</p>
                        </Link>
                        <Link href="/balance-transfer-benefit-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <Shuffle className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Balance Transfer Benefit</p>
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
