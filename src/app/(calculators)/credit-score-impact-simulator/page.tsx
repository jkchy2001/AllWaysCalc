
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
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  currentScore: z.coerce.number().min(300).max(900),
  action: z.enum(['missedPayment', 'lowerUtilization', 'hardInquiry', 'newAccount', 'payOffLoan']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  oldScore: number;
  newScore: number;
  change: number;
};

// Simplified impact factors for simulation
const IMPACT_FACTORS = {
  missedPayment: -50,
  lowerUtilization: 20,
  hardInquiry: -10,
  newAccount: -15,
  payOffLoan: 25,
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

  const { register, handleSubmit, control } = form;

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
                <CardDescription>See how financial actions might affect your credit score.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentScore">Current Credit Score (300-900)</Label>
                    <Input id="currentScore" type="number" {...register('currentScore')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Select an Action</Label>
                    <Controller
                        name="action"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="missedPayment">Miss a loan/card payment</SelectItem>
                                    <SelectItem value="lowerUtilization">Lower credit card balance</SelectItem>
                                    <SelectItem value="hardInquiry">Apply for a new loan/card</SelectItem>
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
                    <p className={`text-lg font-semibold ${result.change > 0 ? 'text-green-600' : 'text-destructive'}`}>
                        An estimated change of {result.change > 0 ? '+' : ''}{result.change} points
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
                 This calculator is a simplified educational tool and does NOT provide real credit advice. The impact numbers are illustrations and not based on actual credit scoring models from CIBIL or any other agency. Real credit scores are complex and influenced by many factors. This tool is for entertainment and educational purposes only.
                </p>
            </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
