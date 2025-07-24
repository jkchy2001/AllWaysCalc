
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  currentEmi: z.coerce.number().min(1, 'Current EMI must be positive'),
  remainingTenure: z.coerce.number().int().min(1, 'Tenure must be at least 1 month'),
  newRate: z.coerce.number().min(0, 'New rate must be positive'),
  refinanceCost: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  newEmi: number;
  monthlySavings: number;
  totalSavings: number;
  breakEvenMonths: number;
};

export default function MortgageRefinanceCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentEmi: 45000,
      remainingTenure: 180,
      newRate: 8.5,
      refinanceCost: 20000,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;
  
  const calculatePrincipal = (emi: number, r: number, n: number) => {
    return (emi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
  };
  
  const calculateEmi = (p: number, r: number, n: number) => {
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const onSubmit = (data: FormValues) => {
    const { currentEmi, remainingTenure, newRate, refinanceCost } = data;
    
    // We need to estimate the principal from the current EMI.
    // This requires an estimated current rate. Let's assume a slightly higher rate.
    const estimatedCurrentRate = (newRate + 1) / 100 / 12;
    
    const principal = calculatePrincipal(currentEmi, estimatedCurrentRate, remainingTenure);
    
    const newMonthlyRate = newRate / 100 / 12;
    const newEmi = calculateEmi(principal, newMonthlyRate, remainingTenure);

    const monthlySavings = currentEmi - newEmi;
    const totalSavings = monthlySavings * remainingTenure;
    const breakEvenMonths = refinanceCost > 0 && monthlySavings > 0 ? Math.ceil(refinanceCost / monthlySavings) : 0;

    setResult({
      newEmi,
      monthlySavings,
      totalSavings,
      breakEvenMonths,
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
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Mortgage Refinance Calculator</CardTitle>
                            <CardDescription>Determine if refinancing your home loan is right for you.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentEmi">Current Monthly EMI (₹)</Label>
                                    <Input id="currentEmi" type="number" {...register('currentEmi')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remainingTenure">Remaining Tenure (Months)</Label>
                                    <Input id="remainingTenure" type="number" {...register('remainingTenure')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newRate">New Interest Rate (%)</Label>
                                    <Input id="newRate" type="number" step="0.01" {...register('newRate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="refinanceCost">Refinancing Costs (Fees, etc.) (₹)</Label>
                                    <Input id="refinanceCost" type="number" {...register('refinanceCost')} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Refinance</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Refinance Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-center border-b pb-4 mb-4">
                                    <p className="text-sm text-muted-foreground">Total Potential Savings</p>
                                    <p className="text-3xl font-bold text-primary">{formatCurrency(result.totalSavings)}</p>
                                </div>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>New Monthly EMI</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(result.newEmi)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Monthly Savings</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(result.monthlySavings)}</TableCell>
                                        </TableRow>
                                         <TableRow>
                                            <TableCell>Break-even Point</TableCell>
                                            <TableCell className="text-right font-medium">{formatMonthsToYears(result.breakEvenMonths)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
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
                        <Link href="/balance-transfer-benefit-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Balance Transfer Benefit</p>
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
