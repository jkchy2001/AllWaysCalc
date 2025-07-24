
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Balance Transfer Benefit Calculator',
  description: 'See how much you can save by transferring your existing loan to a new lender with a lower interest rate. Analyze your EMI reduction and total savings.',
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
import { Home, Shuffle, FileMinus, CreditCard } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  outstandingPrincipal: z.coerce.number().min(1, 'Principal must be positive'),
  existingRate: z.coerce.number().min(0, 'Rate must be positive'),
  remainingTenure: z.coerce.number().int().min(1, 'Tenure must be at least 1 month'),
  newRate: z.coerce.number().min(0, 'New rate must be positive'),
  processingFee: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    existingEmi: number;
    newEmi: number;
    monthlySavings: number;
    totalSavings: number;
    netSavings: number;
};

export default function BalanceTransferCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outstandingPrincipal: 2000000,
      existingRate: 9.5,
      remainingTenure: 180,
      newRate: 8.5,
      processingFee: 10000,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;
  
  const calculateEmi = (p: number, r: number, n: number) => {
    if (r === 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const onSubmit = (data: FormValues) => {
    const { outstandingPrincipal, existingRate, remainingTenure, newRate, processingFee } = data;
    
    const oldMonthlyRate = existingRate / 100 / 12;
    const newMonthlyRate = newRate / 100 / 12;

    const existingEmi = calculateEmi(outstandingPrincipal, oldMonthlyRate, remainingTenure);
    const newEmi = calculateEmi(outstandingPrincipal, newMonthlyRate, remainingTenure);
    
    const monthlySavings = existingEmi - newEmi;
    const totalSavings = monthlySavings * remainingTenure;
    const netSavings = totalSavings - processingFee;

    setResult({
      existingEmi,
      newEmi,
      monthlySavings,
      totalSavings,
      netSavings,
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
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Balance Transfer Benefit Calculator</CardTitle>
                            <CardDescription>See how much you can save by transferring your existing loan to a new lender with a lower interest rate.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="outstandingPrincipal">Outstanding Loan Amount (₹)</Label>
                                    <p className="text-xs text-muted-foreground">The current principal amount you still owe.</p>
                                    <Input id="outstandingPrincipal" type="number" {...register('outstandingPrincipal')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="existingRate">Existing Interest Rate (%)</Label>
                                    <p className="text-xs text-muted-foreground">The annual interest rate on your current loan.</p>
                                    <Input id="existingRate" type="number" step="0.01" {...register('existingRate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remainingTenure">Remaining Tenure (Months)</Label>
                                     <p className="text-xs text-muted-foreground">The number of months left on your current loan.</p>
                                    <Input id="remainingTenure" type="number" {...register('remainingTenure')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newRate">New Interest Rate (%)</Label>
                                     <p className="text-xs text-muted-foreground">The proposed annual interest rate from the new lender.</p>
                                    <Input id="newRate" type="number" step="0.01" {...register('newRate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="processingFee">Processing Fee (₹)</Label>
                                     <p className="text-xs text-muted-foreground">Any fees charged by the new lender for the transfer.</p>
                                    <Input id="processingFee" type="number" {...register('processingFee')} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Savings</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Savings Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-center border-b pb-4 mb-4">
                                    <p className="text-sm text-muted-foreground">Net Savings after Fees</p>
                                    <p className="text-3xl font-bold text-primary">{formatCurrency(result.netSavings)}</p>
                                </div>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Monthly EMI Savings</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(result.monthlySavings)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Total Savings over Tenure</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(result.totalSavings)}</TableCell>
                                        </TableRow>
                                         <TableRow>
                                            <TableCell>Existing EMI</TableCell>
                                            <TableCell className="text-right">{formatCurrency(result.existingEmi)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>New EMI</TableCell>
                                            <TableCell className="text-right">{formatCurrency(result.newEmi)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`I could save ${formatCurrency(result.netSavings)} by transferring my loan!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Understanding Loan Balance Transfer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            A balance transfer involves moving your outstanding loan amount from your current lender to a new one, typically to take advantage of a lower interest rate. This can lead to significant savings over the life of the loan. This calculator helps you see the potential financial benefit.
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>When is a balance transfer a good idea?</AccordionTrigger>
                                <AccordionContent>
                                    A balance transfer makes sense if the interest rate offered by the new lender is significantly lower than your current rate. It's crucial to factor in any processing fees or other charges associated with the transfer. This calculator helps you by showing the "Net Savings" after accounting for those fees. If the net savings are positive and substantial, it's generally a good move.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>What should I look for when considering a balance transfer?</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Interest Rate:</strong> The most important factor. Ensure the new rate is low enough to make a real difference.</li>
                                        <li><strong>Processing Fee:</strong> This is a one-time cost that can eat into your savings.</li>
                                        <li><strong>Other Charges:</strong> Check for hidden costs like legal fees, stamp duty, or prepayment penalties on the new loan.</li>
                                        <li><strong>Lender Reputation:</strong> Ensure the new lender is reputable and provides good customer service.</li>
                                        <li><strong>Eligibility:</strong> You will need a good credit history and stable income to be approved for a balance transfer.</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                              <AccordionTrigger>What are the risks?</AccordionTrigger>
                              <AccordionContent>
                               The main risk is that the costs of the transfer (processing fees) could outweigh the interest savings, especially if the rate difference is small or your remaining tenure is short. Additionally, the process requires paperwork and can take time.
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
                        <Link href="/mortgage-refinance-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <Home className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Mortgage Refinance</p>
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
