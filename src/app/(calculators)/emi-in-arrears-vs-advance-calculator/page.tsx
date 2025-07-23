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
import { Home, CalendarClock } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

    // Standard EMI (in Arrears)
    const emiArrears = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaymentArrears = emiArrears * n;
    const totalInterestArrears = totalPaymentArrears - p;

    // EMI in Advance
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
                            <CardDescription>See the interest savings by paying your EMI at the start of the month.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                                    <Input id="loanAmount" type="number" {...register('loanAmount')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                                    <Input id="loanTerm" type="number" {...register('loanTerm')} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Compare</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Comparison Result</CardTitle>
                                <CardDescription className="text-center">By paying in advance, you could save <span className="font-bold text-primary">{formatCurrency(result.interestSaved)}</span> in total interest.</CardDescription>
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
            </div>
        </main>
    </div>
  );
}
