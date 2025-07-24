
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
  outstandingPrincipal: z.coerce.number().min(1, "Principal must be positive."),
  currentRate: z.coerce.number().min(0.1, "Rate must be positive."),
  remainingTenure: z.coerce.number().int().min(1, 'Tenure must be at least 1 month'),
  newRate: z.coerce.number().min(0, 'New rate must be positive'),
  refinanceCost: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  currentEmi: number;
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
      outstandingPrincipal: 5000000,
      currentRate: 9.5,
      remainingTenure: 180,
      newRate: 8.5,
      refinanceCost: 25000,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;
  
  const calculateEmi = (p: number, r: number, n: number) => {
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const onSubmit = (data: FormValues) => {
    const { outstandingPrincipal, currentRate, remainingTenure, newRate, refinanceCost } = data;
    
    const currentMonthlyRate = currentRate / 100 / 12;
    const newMonthlyRate = newRate / 100 / 12;
    
    const currentEmi = calculateEmi(outstandingPrincipal, currentMonthlyRate, remainingTenure);
    const newEmi = calculateEmi(outstandingPrincipal, newMonthlyRate, remainingTenure);

    const monthlySavings = currentEmi - newEmi;
    const totalSavings = (monthlySavings * remainingTenure) - refinanceCost;
    const breakEvenMonths = refinanceCost > 0 && monthlySavings > 0 ? Math.ceil(refinanceCost / monthlySavings) : 0;

    setResult({
      currentEmi,
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
    if (months === 0) return "Instantly";
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years > 0 ? `${years}y ` : ''}${remainingMonths > 0 ? `${remainingMonths}m` : ''}`.trim();
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
                            <CardDescription>Determine if refinancing your home loan is a financially sound decision by calculating potential savings.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="outstandingPrincipal">Outstanding Loan Amount (₹)</Label>
                                    <Input id="outstandingPrincipal" type="number" {...register('outstandingPrincipal')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentRate">Current Rate (%)</Label>
                                        <Input id="currentRate" type="number" step="0.01" {...register('currentRate')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newRate">New Rate (%)</Label>
                                        <Input id="newRate" type="number" step="0.01" {...register('newRate')} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remainingTenure">Remaining Tenure (Months)</Label>
                                    <Input id="remainingTenure" type="number" {...register('remainingTenure')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="refinanceCost">Refinancing Costs (Fees, etc.) (₹)</Label>
                                    <Input id="refinanceCost" type="number" {...register('refinanceCost')} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Analyze Refinance</Button>
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
                                    <p className="text-sm text-muted-foreground">Total Potential Lifetime Savings</p>
                                    <p className="text-3xl font-bold text-primary">{formatCurrency(result.totalSavings)}</p>
                                </div>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Current Monthly EMI</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(result.currentEmi)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>New Monthly EMI</TableCell>
                                            <TableCell className="text-right font-medium text-green-600">{formatCurrency(result.newEmi)}</TableCell>
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
                             <CardFooter>
                                <p className="text-xs text-muted-foreground">The break-even point is the time it takes for your monthly savings to cover the refinancing costs.</p>
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="font-headline">Understanding Mortgage Refinancing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Refinancing means replacing your existing mortgage with a new one. The primary goal is usually to secure a lower interest rate, which can reduce your monthly EMI and save you a significant amount of money over the life of the loan. This calculator helps you see if it's a worthwhile move.
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>What is the "Break-Even Point"?</AccordionTrigger>
                                <AccordionContent>
                                    The break-even point is a crucial metric in refinancing. It's the point in time when your accumulated monthly savings equal the initial costs of refinancing (like processing fees and legal charges). If you plan to stay in your home longer than the break-even point, refinancing is likely a good financial decision.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>When should I consider refinancing?</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Interest rates have dropped:</strong> If current market rates are significantly lower than your existing loan rate.</li>
                                        <li><strong>Your credit score has improved:</strong> A better credit score can make you eligible for much lower interest rates than you were initially offered.</li>
                                        <li><strong>You want to change your loan term:</strong> You might want to switch from a 30-year to a 15-year loan to pay it off faster, or vice-versa to lower your monthly payments.</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>What are the potential risks or downsides?</AccordionTrigger>
                                <AccordionContent>
                                    The primary downside is the upfront cost. If you don't stay in the property long enough to pass the break-even point, you could lose money on the transaction. Additionally, if you refinance to a longer term (e.g., a new 30-year loan when you only had 20 years left), you might lower your monthly payment but could end up paying more total interest over the life of the new loan.
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
                            <Home className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Home Loan Calculator</p>
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
