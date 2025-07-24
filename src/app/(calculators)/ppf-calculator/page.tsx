
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

const formSchema = z.object({
  yearlyInvestment: z.coerce.number().min(500, 'Minimum yearly investment is ₹500').max(150000, 'Maximum yearly investment is ₹1,50,000'),
  rate: z.coerce.number().min(0, 'Interest rate must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  maturityValue: number;
  totalInvestment: number;
  totalInterest: number;
};

export default function PPFCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const termInYears = 15;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearlyInvestment: 150000,
      rate: 7.1,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { yearlyInvestment, rate } = data;
    const P = yearlyInvestment;
    const r = rate / 100;
    
    let balance = 0;
    for (let i = 0; i < termInYears; i++) {
        balance += P;
        balance = balance * (1 + r);
    }

    const totalInvestment = P * termInYears;
    const totalInterest = balance - totalInvestment;

    setResult({
      maturityValue: balance,
      totalInvestment,
      totalInterest,
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
                <CardTitle className="font-headline text-2xl">PPF Calculator</CardTitle>
                <CardDescription>Calculate the maturity value of your Public Provident Fund.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearlyInvestment">Yearly Investment (₹)</Label>
                    <Input id="yearlyInvestment" type="number" {...register('yearlyInvestment')} />
                    {errors.yearlyInvestment && <p className="text-destructive text-sm">{errors.yearlyInvestment.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                    <Input id="rate" type="number" step="0.01" {...register('rate')} />
                    {errors.rate && <p className="text-destructive text-sm">{errors.rate.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label>Term (Years)</Label>
                    <Input type="number" value={termInYears} disabled />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">PPF Maturity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className='font-bold'>Maturity Value:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.maturityValue)}</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                     <div className="flex justify-between">
                      <span>Total Investment:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest Earned:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My PPF will mature to ${formatCurrency(result.maturityValue)}!`} />
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
                The Public Provident Fund (PPF) is a long-term, government-backed savings scheme in India. It offers tax benefits and a guaranteed rate of return, making it a popular choice for retirement planning and wealth creation.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                    This calculator iterates yearly:<br/>
                    New Balance = (Old Balance + Yearly Investment) * (1 + Annual Rate)
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is the lock-in period for a PPF account?</AccordionTrigger>
                      <AccordionContent>
                        A PPF account has a mandatory lock-in period of 15 years. After maturity, it can be extended in blocks of 5 years with or without further contributions.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Are PPF investments and returns taxable?</AccordionTrigger>
                      <AccordionContent>
                        PPF enjoys an Exempt-Exempt-Exempt (EEE) status. This means the amount you invest, the interest you earn, and the maturity amount are all tax-free.
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
