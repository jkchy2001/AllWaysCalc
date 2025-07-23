
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
import { differenceInCalendarMonths, differenceInDays, format, parseISO } from 'date-fns';

const formSchema = z.object({
  tdsAmount: z.coerce.number().min(1, 'TDS amount must be positive.'),
  deductionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  depositDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
}).refine(data => new Date(data.depositDate) >= new Date(data.deductionDate), {
    message: "Deposit date cannot be earlier than the deduction date.",
    path: ["depositDate"],
});


type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  lateFee: number;
  interest: number;
  totalPenalty: number;
  delayDays: number;
  delayMonths: number;
};

export default function TdsLateFeeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tdsAmount: 5000,
      deductionDate: format(new Date(), 'yyyy-MM-dd'),
      depositDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const deductionDate = parseISO(data.deductionDate);
    const depositDate = parseISO(data.depositDate);

    // Due date is the 7th of the next month
    const dueDate = new Date(deductionDate.getFullYear(), deductionDate.getMonth() + 1, 8);
    
    if (depositDate <= dueDate) {
        setResult({ lateFee: 0, interest: 0, totalPenalty: 0, delayDays: 0, delayMonths: 0 });
        return;
    }
    
    const delayDays = differenceInDays(depositDate, dueDate);
    
    // Late fee under Section 234E
    const lateFee = delayDays * 200;

    // Interest under Section 201(1A)
    const delayMonths = differenceInCalendarMonths(depositDate, deductionDate);
    const interest = data.tdsAmount * 0.015 * (delayMonths + 1);

    const totalPenalty = lateFee + interest;

    setResult({
      lateFee,
      interest,
      totalPenalty,
      delayDays,
      delayMonths: delayMonths + 1
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
                <CardTitle className="font-headline text-2xl">TDS Late Fee & Penalty Calculator</CardTitle>
                <CardDescription>Estimate penalties for delayed TDS payment.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tdsAmount">TDS Amount (₹)</Label>
                    <Input id="tdsAmount" type="number" {...register('tdsAmount')} />
                    {errors.tdsAmount && <p className="text-destructive text-sm">{errors.tdsAmount.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="deductionDate">Date of TDS Deduction</Label>
                    <Input id="deductionDate" type="date" {...register('deductionDate')} />
                    {errors.deductionDate && <p className="text-destructive text-sm">{errors.deductionDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depositDate">Date of TDS Deposit</Label>
                    <Input id="depositDate" type="date" {...register('depositDate')} />
                    {errors.depositDate && <p className="text-destructive text-sm">{errors.depositDate.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Penalty</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Penalty Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <span className='font-bold'>Total Penalty:</span>
                        <span className="text-2xl font-bold text-destructive">{formatCurrency(result.totalPenalty)}</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                       <div className="flex justify-between">
                          <span>Late Filing Fee (u/s 234E):</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.lateFee)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Interest on Late Deposit (u/s 201(1A)):</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.interest)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The estimated penalty for TDS late payment is ${formatCurrency(result.totalPenalty)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding TDS Penalties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Failure to deposit Tax Deducted at Source (TDS) on time can lead to significant penalties under the Income Tax Act. This calculator provides an estimate of these penalties.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Penalty Calculation</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Interest for Late Deposit (Section 201(1A))</AccordionTrigger>
                      <AccordionContent>
                       Interest is charged at **1.5% per month or part of a month** on the TDS amount, from the date the tax was deducted to the date it is actually deposited.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Fee for Late Filing (Section 234E)</AccordionTrigger>
                      <AccordionContent>
                       A late filing fee of **₹200 per day** is levied for the delay in filing the TDS return. The total fee cannot exceed the TDS amount. This calculator assumes the return is filed on the same day as the deposit.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                 <p className="text-sm font-semibold mt-4 text-destructive">Disclaimer: This is for estimation purposes only and should not be considered legal or financial advice. Consult with a tax professional for accurate calculations and compliance.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
