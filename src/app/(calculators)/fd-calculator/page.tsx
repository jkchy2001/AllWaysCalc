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
  principal: z.coerce.number().min(1, 'Investment amount must be positive.'),
  rate: z.coerce.number().min(0, 'Interest rate must be positive.'),
  years: z.coerce.number().int().min(1, 'Term must be at least 1 year.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  maturityValue: number;
  totalInterest: number;
};

export default function FDCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 100000,
      rate: 7.5,
      years: 5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { principal, rate, years } = data;
    const n = 4; // Compounded quarterly
    const t = years;
    const r = rate / 100;
    
    const maturityValue = principal * Math.pow((1 + r / n), n * t);
    const totalInterest = maturityValue - principal;

    setResult({
      maturityValue,
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
                <CardTitle className="font-headline text-2xl">FD Calculator</CardTitle>
                <CardDescription>Calculate the maturity value of your Fixed Deposit.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Total Investment (₹)</Label>
                    <Input id="principal" type="number" {...register('principal')} />
                    {errors.principal && <p className="text-destructive text-sm">{errors.principal.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                    <Input id="rate" type="number" step="0.01" {...register('rate')} />
                    {errors.rate && <p className="text-destructive text-sm">{errors.rate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years">Term (Years)</Label>
                    <Input id="years" type="number" {...register('years')} />
                    {errors.years && <p className="text-destructive text-sm">{errors.years.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">FD Maturity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className='font-bold'>Maturity Value:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.maturityValue)}</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Invested Amount:</span>
                      <span className="font-medium text-foreground">{formatCurrency(form.getValues('principal'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest Earned:</span>
                      <span className="font-medium text-foreground">{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My FD will mature to ${formatCurrency(result.maturityValue)}!`} />
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
                A Fixed Deposit (FD) is a financial instrument where you invest a lump sum for a fixed period at a predetermined interest rate. This calculator helps you find out the total amount you'll receive upon maturity.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      A = P(1 + r/n)^(nt)<br/><br/>
                      <b>A</b> = Maturity Value<br/>
                      <b>P</b> = Principal Amount<br/>
                      <b>r</b> = Annual Interest Rate<br/>
                      <b>n</b> = Compounding Frequency (Quarterly by default)<br/>
                      <b>t</b> = Term in Years
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Why is compounding frequency important?</AccordionTrigger>
                      <AccordionContent>
                        Most banks compound the interest on FDs quarterly. This means interest is calculated every three months and added to the principal, leading to higher returns compared to annual compounding.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Is the interest earned on an FD taxable?</AccordionTrigger>
                      <AccordionContent>
                        Yes, the interest income from a Fixed Deposit is fully taxable as per your income tax slab. Banks may also deduct TDS (Tax Deducted at Source) if the interest exceeds a certain threshold.
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
