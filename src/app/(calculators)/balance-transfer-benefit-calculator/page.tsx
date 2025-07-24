
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
import { Home, Shuffle } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
                            <CardDescription>See how much you can save by transferring your loan.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="outstandingPrincipal">Outstanding Loan Amount (₹)</Label>
                                    <Input id="outstandingPrincipal" type="number" {...register('outstandingPrincipal')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="existingRate">Existing Interest Rate (%)</Label>
                                    <Input id="existingRate" type="number" step="0.01" {...register('existingRate')} />
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
                                    <Label htmlFor="processingFee">Processing Fee (₹)</Label>
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
            </div>
        </main>
    </div>
  );
}
