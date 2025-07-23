
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Home, Trash2 } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const taxSlabSchema = z.object({
  limit: z.coerce.number().min(0),
  rate: z.coerce.number().min(0).max(100),
});

const formSchema = z.object({
  grossIncome: z.coerce.number().min(0, 'Gross income must be a positive number.'),
  deductions80c: z.coerce.number().min(0, 'Deductions must be a positive number.'),
  standardDeduction: z.coerce.number().min(0, 'Standard deduction must be a positive number.'),
  taxRegime: z.enum(['old', 'new', 'custom']),
  customSlabs: z.array(taxSlabSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  taxableIncome: number;
  taxAmount: number;
  surcharge: number;
  healthAndEducationCess: number;
  totalTax: number;
  slabWiseTax: { slab: string; tax: number }[];
};

const newRegimeSlabs = [
  { limit: 300000, rate: 0 },
  { limit: 600000, rate: 5 },
  { limit: 900000, rate: 10 },
  { limit: 1200000, rate: 15 },
  { limit: 1500000, rate: 20 },
  { limit: Infinity, rate: 30 },
];

const oldRegimeSlabs = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 5 },
  { limit: 1000000, rate: 20 },
  { limit: Infinity, rate: 30 },
];


export default function IncomeTaxCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossIncome: undefined,
      deductions80c: 0,
      standardDeduction: 50000,
      taxRegime: 'new',
      customSlabs: [{ limit: 500000, rate: 10 }, { limit: 1000000, rate: 20 }, { limit: Infinity, rate: 30 }],
    },
  });

  const { register, handleSubmit, watch, control, formState: { errors } } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customSlabs",
  });

  const taxRegime = watch('taxRegime');

  const calculateTax = (taxableIncome: number, regime: 'old' | 'new' | 'custom', customSlabs: {limit: number, rate: number}[]): { tax: number, slabWiseTax: { slab: string, tax: number }[]} => {
    let tax = 0;
    const slabWiseTax: { slab: string; tax: number }[] = [];
    
    let slabs: {limit: number, rate: number}[];

    switch(regime) {
        case 'new':
            slabs = newRegimeSlabs.map(s => ({...s, rate: s.rate / 100}));
            break;
        case 'old':
            slabs = oldRegimeSlabs.map(s => ({...s, rate: s.rate / 100}));
            break;
        case 'custom':
            slabs = [...customSlabs].sort((a,b) => a.limit - b.limit).map(s => ({...s, rate: s.rate / 100}));
            break;
    }

    let lastLimit = 0;
    for (const slab of slabs) {
      if (taxableIncome > lastLimit) {
        const taxableInSlab = Math.min(taxableIncome - lastLimit, slab.limit - lastLimit);
        const taxInSlab = taxableInSlab * slab.rate;
        tax += taxInSlab;
        
        const slabLabel = lastLimit === 0 
            ? `Up to ${formatCurrency(slab.limit)}` 
            : slab.limit === Infinity 
                ? `Above ${formatCurrency(lastLimit)}`
                : `${formatCurrency(lastLimit + 1)} - ${formatCurrency(slab.limit)}`;

        slabWiseTax.push({ slab: `${slabLabel} @ ${slab.rate * 100}%`, tax: taxInSlab });
      }
      lastLimit = slab.limit;
      if(lastLimit === Infinity) break;
    }
    return { tax, slabWiseTax };
  };

  const onSubmit = (data: FormValues) => {
    const { grossIncome, deductions80c, standardDeduction, taxRegime, customSlabs = [] } = data;
    
    let applicableDeductions = 0;
    if(taxRegime === 'old') {
        applicableDeductions = Math.min(deductions80c, 150000) + 50000; // Assuming 50k standard for old too
    } else if (taxRegime === 'new' || taxRegime === 'custom') {
        applicableDeductions = standardDeduction;
    }

    let taxableIncome = grossIncome - applicableDeductions;
    if (taxableIncome < 0) taxableIncome = 0;

    const incomeForRebate = grossIncome - applicableDeductions;
    let { tax: taxAmount, slabWiseTax } = calculateTax(taxableIncome, taxRegime, customSlabs);

    if (taxRegime === 'new' && incomeForRebate <= 700000) {
        taxAmount = 0;
    } else if (taxRegime === 'old' && incomeForRebate <= 500000) {
        if (taxAmount <= 12500) {
            taxAmount = 0;
        }
    }

    if (taxAmount === 0) {
        slabWiseTax = [{ slab: 'Tax Rebate Applied', tax: 0 }];
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
    
    setResult({
      taxableIncome,
      taxAmount,
      surcharge,
      healthAndEducationCess,
      totalTax,
      slabWiseTax
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
                <CardTitle className="font-headline text-2xl">Income Tax Calculator (India)</CardTitle>
                <CardDescription>Estimate your tax liability for FY 2023-24.</CardDescription>
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
                    className="grid grid-cols-3 gap-4"
                    value={taxRegime}
                    onValueChange={(value) => form.setValue('taxRegime', value as 'old' | 'new' | 'custom')}
                  >
                    <div>
                      <RadioGroupItem value="new" id="new" className="peer sr-only" />
                      <Label htmlFor="new" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">New</Label>
                    </div>
                    <div>
                      <RadioGroupItem value="old" id="old" className="peer sr-only" />
                      <Label htmlFor="old" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Old</Label>
                    </div>
                     <div>
                      <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
                      <Label htmlFor="custom" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Custom</Label>
                    </div>
                  </RadioGroup>
                  
                  {taxRegime === 'old' && (
                    <div className="space-y-2">
                      <Label htmlFor="deductions80c">Deductions under 80C, 80D etc. (₹)</Label>
                      <Input id="deductions80c" type="number" step="0.01" {...register('deductions80c')} />
                      {errors.deductions80c && <p className="text-destructive text-sm">{errors.deductions80c.message}</p>}
                    </div>
                  )}

                  {(taxRegime === 'new' || taxRegime === 'custom') && (
                     <div className="space-y-2">
                        <Label htmlFor="standardDeduction">Standard Deduction (₹)</Label>
                        <Input id="standardDeduction" type="number" step="0.01" {...register('standardDeduction')} />
                    </div>
                  )}
                  
                  {taxRegime === 'custom' && (
                    <div className="space-y-4 rounded-md border p-4">
                        <Label className="font-semibold">Custom Tax Slabs</Label>
                        {fields.map((field, index) => (
                           <div key={field.id} className="flex items-center gap-2">
                                <Input type="number" placeholder="Up to Amount (₹)" {...register(`customSlabs.${index}.limit`)} />
                                <Input type="number" placeholder="Rate (%)" {...register(`customSlabs.${index}.rate`)} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                           </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ limit: 0, rate: 0 })}>Add Slab</Button>
                    </div>
                  )}

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Tax</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Tax Liability Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <span className='font-bold'>Total Tax Payable:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(result.totalTax)}</span>
                    </div>
                     <div className="space-y-2 text-sm text-muted-foreground">
                       <div className="flex justify-between">
                          <span>Taxable Income:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.taxableIncome)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Income Tax (before cess):</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.taxAmount)}</span>
                      </div>
                    </div>
                     <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Slab</TableHead>
                            <TableHead className="text-right">Tax</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.slabWiseTax.map((slab, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs">{slab.slab}</TableCell>
                              <TableCell className="text-right text-xs">{formatCurrency(slab.tax)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
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
                  <SharePanel resultText={`My estimated income tax for the year is ${formatCurrency(result.totalTax)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Income Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               This calculator provides an estimate of your income tax liability. You can use the standard tax regimes for FY 2023-24 (AY 2024-25) or define your own custom tax slabs for hypothetical scenarios.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">How is Tax Calculated?</h3>
                  <p>Income tax is calculated based on a slab system. This means that different portions of your income are taxed at different rates. For example, the first part of your income might be tax-free, the next portion taxed at 5%, the next at 10%, and so on. The total tax is the sum of the tax calculated for each slab.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Old vs. New Tax Regime: What's the difference?</AccordionTrigger>
                      <AccordionContent>
                       The **Old Regime** allows you to claim a wide range of deductions and exemptions, such as those under Section 80C (for investments), 80D (for medical insurance), HRA (House Rent Allowance), and LTA (Leave Travel Allowance). The tax slabs are generally higher.<br/><br/>
                       The **New Regime** offers lower, more simplified tax slabs but requires you to forgo most of the common deductions and exemptions. From FY 2023-24, the New Regime is the default option, and it includes a Standard Deduction of ₹50,000 for salaried individuals. It's often beneficial for those with fewer investments or exemptions to claim.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What is a Tax Rebate?</AccordionTrigger>
                      <AccordionContent>
                       A tax rebate under Section 87A is a relief provided to taxpayers with lower incomes. For the FY 2023-24, under the New Regime, if your taxable income is up to ₹7,00,000, you effectively pay zero tax. Under the Old Regime, if your taxable income is up to ₹5,00,000, you can claim a rebate of up to ₹12,500, which also results in zero tax payable.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>What is Surcharge and Cess?</AccordionTrigger>
                      <AccordionContent>
                        **Surcharge** is an additional tax levied on high-income earners (e.g., those with income above ₹50 lakh).<br/><br/>
                        **Health and Education Cess** is a tax levied on top of your income tax (including surcharge) at a rate of 4%. It is used by the government to fund health and education initiatives.
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

    