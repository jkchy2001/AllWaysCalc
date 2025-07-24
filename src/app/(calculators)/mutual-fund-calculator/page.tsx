
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  investmentType: z.enum(['sip', 'lumpsum']),
  monthlyInvestment: z.coerce.number().optional(),
  lumpsumAmount: z.coerce.number().optional(),
  rate: z.coerce.number().min(0, 'Expected return rate must be positive.'),
  years: z.coerce.number().int().min(1, 'Term must be at least 1 year.'),
}).refine(data => {
    if (data.investmentType === 'sip') return data.monthlyInvestment && data.monthlyInvestment > 0;
    if (data.investmentType === 'lumpsum') return data.lumpsumAmount && data.lumpsumAmount > 0;
    return false;
}, {
    message: "Please fill in the required investment amount.",
    path: ['investmentType'],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  futureValue: number;
  totalInterest: number;
  totalInvestment: number;
};

export default function MutualFundCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      investmentType: 'sip',
      monthlyInvestment: 10000,
      lumpsumAmount: 100000,
      rate: 12,
      years: 10,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const investmentType = watch('investmentType');

  const onSubmit = (data: FormValues) => {
    const { rate, years } = data;
    let P = 0;
    let totalInvestment = 0;
    let futureValue = 0;

    if (data.investmentType === 'sip' && data.monthlyInvestment) {
        P = data.monthlyInvestment;
        const n = years * 12;
        const i = rate / 100 / 12;
        futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        totalInvestment = P * n;
    } else if (data.investmentType === 'lumpsum' && data.lumpsumAmount) {
        P = data.lumpsumAmount;
        const r = rate / 100;
        const t = years;
        futureValue = P * Math.pow(1 + r, t);
        totalInvestment = P;
    }
    
    const totalInterest = futureValue - totalInvestment;

    setResult({
      futureValue,
      totalInterest,
      totalInvestment,
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
                <CardTitle className="font-headline text-2xl">Mutual Fund Calculator</CardTitle>
                <CardDescription>Estimate returns for SIP or Lumpsum investments.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <RadioGroup
                        defaultValue="sip"
                        className="grid grid-cols-2 gap-4"
                        onValueChange={(value) => form.setValue('investmentType', value as 'sip' | 'lumpsum')}
                        {...register('investmentType')}
                    >
                        <div>
                            <RadioGroupItem value="sip" id="sip" className="peer sr-only" />
                            <Label htmlFor="sip" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                SIP
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="lumpsum" id="lumpsum" className="peer sr-only" />
                            <Label htmlFor="lumpsum" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                Lumpsum
                            </Label>
                        </div>
                    </RadioGroup>

                  {investmentType === 'sip' && (
                    <div className="space-y-2">
                        <Label htmlFor="monthlyInvestment">Monthly Investment (₹)</Label>
                        <Input id="monthlyInvestment" type="number" {...register('monthlyInvestment')} />
                    </div>
                  )}
                  {investmentType === 'lumpsum' && (
                    <div className="space-y-2">
                        <Label htmlFor="lumpsumAmount">Lumpsum Amount (₹)</Label>
                        <Input id="lumpsumAmount" type="number" {...register('lumpsumAmount')} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="rate">Expected Annual Return (%)</Label>
                    <Input id="rate" type="number" step="0.01" {...register('rate')} />
                    {errors.rate && <p className="text-destructive text-sm">{errors.rate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years">Investment Period (Years)</Label>
                    <Input id="years" type="number" {...register('years')} />
                    {errors.years && <p className="text-destructive text-sm">{errors.years.message}</p>}
                  </div>
                  {errors.investmentType && <p className="text-destructive text-sm">{errors.investmentType.message}</p>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Investment Projection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className='font-bold'>Future Value:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.futureValue)}</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Invested:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wealth Gained:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My mutual fund investment could grow to ${formatCurrency(result.futureValue)}!`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Mutual funds pool money from many investors to invest in a diversified portfolio of stocks, bonds, or other assets. This calculator helps project the potential returns on your mutual fund investments, whether you invest systematically (SIP) or in a single lumpsum.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Disclaimer</h3>
                   <p>Mutual fund investments are subject to market risks. The calculated value is an estimate based on the projected rate of return and is not guaranteed. Past performance is not indicative of future results.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is an Expense Ratio?</AccordionTrigger>
                      <AccordionContent>
                        An expense ratio is an annual fee charged by the mutual fund company to manage the fund. It's a percentage of your total investment and affects your overall returns. This calculator does not account for the expense ratio.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What are Exit Loads?</AccordionTrigger>
                      <AccordionContent>
                        An exit load is a fee charged when you redeem (sell) your mutual fund units, usually within a short period (e.g., one year). It's meant to discourage short-term trading.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
