
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credit Score Impact Simulator',
  description: 'An educational tool to see how common financial actions like missed payments, hard inquiries, or paying down debt might affect your credit score.',
};

'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Home, BarChart } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  currentScore: z.coerce.number().min(300, "Score must be between 300 and 900.").max(900, "Score must be between 300 and 900."),
  action: z.enum(['missedPayment', 'lowerUtilization', 'hardInquiry', 'newAccount', 'payOffLoan']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  oldScore: number;
  newScore: number;
  change: number;
};

// Simplified impact factors for simulation. These are for illustrative purposes only.
const IMPACT_FACTORS = {
  missedPayment: -70,
  lowerUtilization: 25,
  hardInquiry: -10,
  newAccount: -15,
  payOffLoan: 20,
};

export default function CreditScoreSimulatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentScore: 750,
      action: 'missedPayment',
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const change = IMPACT_FACTORS[data.action];
    let newScore = data.currentScore + change;
    newScore = Math.max(300, Math.min(900, newScore)); // Clamp score between 300 and 900
    
    setResult({
      oldScore: data.currentScore,
      newScore,
      change,
    });
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
                <CardTitle className="font-headline text-2xl">Credit Score Impact Simulator</CardTitle>
                <CardDescription>See how common financial actions might affect your credit score with this educational tool.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentScore">Current Credit Score (300-900)</Label>
                    <p className="text-xs text-muted-foreground">Enter your current approximate credit score (e.g., CIBIL).</p>
                    <Input id="currentScore" type="number" {...register('currentScore')} />
                    {errors.currentScore && <p className="text-destructive text-sm">{errors.currentScore.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Select an Action to Simulate</Label>
                    <p className="text-xs text-muted-foreground">Choose a financial event to see its potential impact.</p>
                    <Controller
                        name="action"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="missedPayment">Miss a loan/card payment by 30 days</SelectItem>
                                    <SelectItem value="lowerUtilization">Pay down credit card balance significantly</SelectItem>
                                    <SelectItem value="hardInquiry">Apply for a new loan/card (hard inquiry)</SelectItem>
                                    <SelectItem value="newAccount">Open a new credit account</SelectItem>
                                    <SelectItem value="payOffLoan">Pay off a loan completely</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Simulate Impact</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Simulated Score Change</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">Your score changed from</p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-2xl font-bold">{result.oldScore}</span>
                        <span className="text-2xl font-bold text-primary">→</span>
                        <span className="text-4xl font-bold text-primary">{result.newScore}</span>
                    </div>
                    <p className={`text-lg font-semibold ${result.change >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        An estimated change of {result.change >= 0 ? '+' : ''}{result.change} points
                    </p>
                </CardContent>
              </Card>
            )}
          </div>
            <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline">Important Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-semibold text-destructive">
                 This calculator is a simplified educational tool and does NOT provide real credit advice. The impact numbers are illustrations and not based on actual credit scoring models from CIBIL, Experian, or any other agency. Real credit scores are complex and influenced by many factors including your entire credit history. The actual impact of any action on your score will vary. This tool is for entertainment and educational purposes only.
                </p>
            </CardContent>
            </Card>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Understanding Your Credit Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        Your credit score is a three-digit number that summarizes your credit history and represents your creditworthiness. Lenders use it to decide whether to approve you for a loan or credit card and at what interest rate.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What are the key factors affecting a credit score?</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Payment History (High Impact):</strong> Consistently paying your bills on time is the single most important factor. Late payments can significantly lower your score.</li>
                                    <li><strong>Credit Utilization (High Impact):</strong> This is the ratio of your credit card balances to your credit limits. Keeping it low (ideally below 30%) is best.</li>
                                    <li><strong>Credit History Length (Medium Impact):</strong> A longer credit history is generally better.</li>
                                    <li><strong>Credit Mix (Low Impact):</strong> Having a mix of different types of credit (like credit cards and installment loans) can be beneficial.</li>
                                    <li><strong>New Credit (Low Impact):</strong> Opening several new accounts in a short period can represent a risk and temporarily lower your score. Each application for credit can result in a "hard inquiry," which can have a small negative impact.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why did paying off a loan not boost my score more?</AccordionTrigger>
                            <AccordionContent>
                                While paying off a loan is a great financial move, it can sometimes have a mixed or minor impact on your score in the short term. This is because it closes an active account, which can slightly reduce your credit history length and credit mix. However, the long-term benefit of having less debt is far more important.
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
                         <Link href="/loan-eligibility-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Loan Eligibility</p>
                        </Link>
                        <Link href="/debt-to-income-ratio-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Debt-to-Income Ratio</p>
                        </Link>
                        <Link href="/credit-card-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Credit Card Interest</p>
                        </Link>
                        <Link href="/balance-transfer-benefit-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Balance Transfer Benefit</p>
                        </Link>
                    </CardContent>
                </Card>
        </div>
      </main>
    </div>
  );
}
