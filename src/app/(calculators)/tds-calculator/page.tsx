
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
  grossIncome: z.coerce.number().min(0, 'Gross income must be a positive number.'),
  deductions80c: z.coerce.number().min(0, 'Deductions must be a positive number.'),
  standardDeduction: z.coerce.number().min(0, 'Standard deduction must be a positive number.'),
  taxRegime: z.enum(['old', 'new']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  taxableIncome: number;
  taxAmount: number;
  surcharge: number;
  healthAndEducationCess: number;
  totalTax: number;
  monthlyTds: number;
};

export default function TdsCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossIncome: undefined,
      deductions80c: 0,
      standardDeduction: 50000,
      taxRegime: 'new',
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const taxRegime = watch('taxRegime');

  const calculateTax = (taxableIncome: number, regime: 'old' | 'new'): number => {
    let tax = 0;
    const slabs = regime === 'new'
      ? [
          { limit: 300000, rate: 0 },
          { limit: 600000, rate: 0.05 },
          { limit: 900000, rate: 0.10 },
          { limit: 1200000, rate: 0.15 },
          { limit: 1500000, rate: 0.20 },
          { limit: Infinity, rate: 0.30 },
        ]
      : [
          { limit: 250000, rate: 0 },
          { limit: 500000, rate: 0.05 },
          { limit: 1000000, rate: 0.20 },
          { limit: Infinity, rate: 0.30 },
        ];

    let lastLimit = 0;
    for (const slab of slabs) {
      if (taxableIncome > lastLimit) {
        const taxableInSlab = Math.min(taxableIncome - lastLimit, slab.limit - lastLimit);
        tax += taxableInSlab * slab.rate;
      }
      lastLimit = slab.limit;
    }
    return tax;
  };

  const onSubmit = (data: FormValues) => {
    const { grossIncome, deductions80c, standardDeduction, taxRegime } = data;
    
    let applicableDeductions = taxRegime === 'new' ? standardDeduction : Math.min(deductions80c, 150000) + standardDeduction;
    let taxableIncome = grossIncome - applicableDeductions;
    if (taxableIncome < 0) taxableIncome = 0;

    const incomeForRebate = grossIncome - applicableDeductions;
    let taxAmount = calculateTax(taxableIncome, taxRegime);

    if (taxRegime === 'new' && incomeForRebate <= 700000) {
        taxAmount = 0;
    } else if (taxRegime === 'old' && incomeForRebate <= 500000) {
        if (taxAmount <= 12500) {
            taxAmount = 0;
        }
    }

    let surcharge = 0;
    if (taxableIncome > 5000000) {
        if (taxableIncome <= 10000000) surcharge = taxAmount * 0.10;
        else if (taxableIncome <= 20000000) surcharge = taxAmount * 0.15;
        else if (taxableIncome <= 50000000) surcharge = taxAmount * 0.25;
        else surcharge = taxAmount * 0.37;
    }

    const healthAndEducationCess = (taxAmount + surcharge) * 0.04;
    const totalTax = taxAmount + surcharge + healthAndEducationCess;
    const monthlyTds = totalTax / 12;
    
    setResult({
      taxableIncome,
      taxAmount,
      surcharge,
      healthAndEducationCess,
      totalTax,
      monthlyTds,
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
                <CardTitle className="font-headline text-2xl">TDS on Salary Calculator (India)</CardTitle>
                <CardDescription>Estimate your monthly tax deduction for FY 2023-24.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="grossIncome">Gross Annual Income (₹)</Label>
                    <Input id="grossIncome" type="number" step="0.01" {...register('grossIncome')} />
                    {errors.grossIncome && <p className="text-destructive text-sm">{errors.grossIncome.message}</p>}
                  </div>

                  <RadioGroup
                    defaultValue="new"
                    className="grid grid-cols-2 gap-4"
                    value={taxRegime}
                    onValueChange={(value) => form.setValue('taxRegime', value as 'old' | 'new')}
                  >
                    <div>
                      <RadioGroupItem value="new" id="new" className="peer sr-only" />
                      <Label htmlFor="new" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">New Regime</Label>
                    </div>
                    <div>
                      <RadioGroupItem value="old" id="old" className="peer sr-only" />
                      <Label htmlFor="old" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Old Regime</Label>
                    </div>
                  </RadioGroup>
                  
                  {taxRegime === 'old' && (
                    <div className="space-y-2">
                      <Label htmlFor="deductions80c">Deductions under 80C, 80D etc. (₹)</Label>
                      <Input id="deductions80c" type="number" step="0.01" {...register('deductions80c')} />
                      {errors.deductions80c && <p className="text-destructive text-sm">{errors.deductions80c.message}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="standardDeduction">Standard Deduction (₹)</Label>
                    <Input id="standardDeduction" type="number" step="0.01" {...register('standardDeduction')} disabled={taxRegime === 'old'}/>
                  </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate TDS</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">TDS Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <span className='font-bold'>Monthly TDS:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(result.monthlyTds)}</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Total Annual Tax:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.totalTax)}</span>
                        </div>
                       <div className="flex justify-between">
                          <span>Taxable Income:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.taxableIncome)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Income Tax:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span>Surcharge:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.surcharge)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span>Health & Edu Cess (4%):</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.healthAndEducationCess)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated monthly TDS is ${formatCurrency(result.monthlyTds)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding TDS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Tax Deducted at Source (TDS) is a means of collecting income tax in India. Your employer deducts a certain amount from your salary every month and pays it to the government on your behalf. This calculator helps estimate that monthly deduction.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">How is TDS on Salary Calculated?</h3>
                  <p>Your employer estimates your total annual income, subtracts eligible deductions to find your taxable income, and then calculates the tax on it based on the applicable slab rates for your chosen tax regime. This total tax is then divided by 12 to arrive at the monthly TDS amount.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is Form 16?</AccordionTrigger>
                      <AccordionContent>
                       Form 16 is a certificate issued by your employer that provides details of the TDS deducted and deposited with the authorities. It is crucial for filing your income tax return.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What if more or less TDS is deducted?</AccordionTrigger>
                      <AccordionContent>
                       If excess TDS has been deducted, you can claim a refund when you file your income tax return. If less TDS has been deducted, you will have to pay the remaining tax (self-assessment tax) while filing your return.
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
