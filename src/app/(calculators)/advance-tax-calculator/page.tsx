
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const taxSlabSchema = z.object({
  limit: z.coerce.number().min(0),
  rate: z.coerce.number().min(0).max(100),
});

const formSchema = z.object({
  ageGroup: z.enum(['below60', '60to80', 'above80']),
  occupationType: z.enum(['salaried', 'business', 'pensioner', 'other']),
  
  salaryIncome: z.coerce.number().optional(),
  businessIncome: z.coerce.number().optional(),
  pensionIncome: z.coerce.number().optional(),
  agriculturalIncome: z.coerce.number().optional(),
  otherIncome: z.coerce.number().optional(),

  deductions80c: z.coerce.number().min(0, 'Deductions must be a positive number.'),
  taxRegime: z.enum(['old', 'new', 'custom']),
  
  customSlabs: z.array(taxSlabSchema).optional(),
  customStandardDeduction: z.coerce.number().min(0).optional(),
  customRebateLimit: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalTax: number;
  installments: { dueDate: string; amount: number; percentage: number }[];
};

const newRegimeSlabs = [
  { limit: 300000, rate: 0 },
  { limit: 600000, rate: 5 },
  { limit: 900000, rate: 10 },
  { limit: 1200000, rate: 15 },
  { limit: 1500000, rate: 20 },
  { limit: Infinity, rate: 30 },
];

const oldRegimeSlabs = {
    below60: [
        { limit: 250000, rate: 0 },
        { limit: 500000, rate: 5 },
        { limit: 1000000, rate: 20 },
        { limit: Infinity, rate: 30 },
    ],
    '60to80': [
        { limit: 300000, rate: 0 },
        { limit: 500000, rate: 5 },
        { limit: 1000000, rate: 20 },
        { limit: Infinity, rate: 30 },
    ],
    above80: [
        { limit: 500000, rate: 0 },
        { limit: 1000000, rate: 20 },
        { limit: Infinity, rate: 30 },
    ],
};


export default function AdvanceTaxCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageGroup: 'below60',
      occupationType: 'salaried',
      salaryIncome: 0,
      businessIncome: 0,
      pensionIncome: 0,
      agriculturalIncome: 0,
      otherIncome: 0,
      deductions80c: 0,
      taxRegime: 'new',
      customSlabs: [{ limit: 300000, rate: 5 }, { limit: 700000, rate: 10 }, { limit: Infinity, rate: 20 }],
      customStandardDeduction: 75000,
      customRebateLimit: 750000,
    },
  });

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customSlabs",
  });

  const taxRegime = watch('taxRegime');
  const ageGroup = watch('ageGroup');

  const calculateTax = (taxableIncome: number, regime: 'old' | 'new' | 'custom', ageGroup: FormValues['ageGroup'], customSlabs: {limit: number, rate: number}[]): number => {
    let tax = 0;
    
    let slabs: {limit: number, rate: number}[];

    switch(regime) {
        case 'new':
            slabs = newRegimeSlabs.map(s => ({...s, rate: s.rate / 100}));
            break;
        case 'old':
            slabs = oldRegimeSlabs[ageGroup].map(s => ({...s, rate: s.rate / 100}));
            break;
        case 'custom':
            slabs = [...customSlabs].sort((a,b) => a.limit - b.limit).map(s => ({...s, rate: s.rate / 100}));
            break;
    }

    let lastLimit = 0;
    for (const slab of slabs) {
      if (taxableIncome > lastLimit) {
        const taxableInSlab = Math.min(taxableIncome - lastLimit, slab.limit - lastLimit);
        tax += taxableInSlab * slab.rate;
      }
      lastLimit = slab.limit;
      if(lastLimit === Infinity) break;
    }
    return tax;
  };

  const onSubmit = (data: FormValues) => {
    const { 
        ageGroup, salaryIncome=0, businessIncome=0, pensionIncome=0, agriculturalIncome=0, otherIncome=0,
        deductions80c, taxRegime, customSlabs = [], customStandardDeduction, customRebateLimit 
    } = data;
    
    const grossIncome = salaryIncome + businessIncome + pensionIncome + otherIncome; // agricultural income handled separately
    
    let applicableDeductions = 0;
    let standardDeduction = 0;

    if (taxRegime === 'new') {
        standardDeduction = 75000;
        applicableDeductions = standardDeduction;
    } else if (taxRegime === 'old') {
        standardDeduction = 50000;
        applicableDeductions = deductions80c + standardDeduction;
    } else { // custom
        standardDeduction = customStandardDeduction || 0;
        applicableDeductions = standardDeduction;
    }

    let taxableIncome = grossIncome - applicableDeductions;
    if (taxableIncome < 0) taxableIncome = 0;

    // Agricultural income logic: added to total income for rate purposes if net agri income > 5000 and total income > basic exemption
    let finalTaxableIncome = taxableIncome;
    if (taxRegime === 'old' && agriculturalIncome > 5000 && taxableIncome > oldRegimeSlabs[ageGroup][0].limit) {
        finalTaxableIncome += agriculturalIncome;
    }

    let taxAmount = calculateTax(finalTaxableIncome, taxRegime, ageGroup, customSlabs || []);

    // Adjust tax for agricultural income if applicable
    if (taxRegime === 'old' && agriculturalIncome > 5000 && taxableIncome > oldRegimeSlabs[ageGroup][0].limit) {
      const taxOnAgri = calculateTax(agriculturalIncome + oldRegimeSlabs[ageGroup][0].limit, taxRegime, ageGroup, customSlabs);
      taxAmount -= taxOnAgri;
    }

    // Rebate logic
    if (taxRegime === 'new' && taxableIncome <= 700000) {
        taxAmount = 0;
    } else if (taxRegime === 'old' && taxableIncome <= 500000) {
        if (taxAmount <= 12500) {
            taxAmount = 0;
        }
    } else if (taxRegime === 'custom' && customRebateLimit && taxableIncome <= customRebateLimit) {
        taxAmount = 0;
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
    
    const installments = totalTax < 10000 ? [] : [
        { dueDate: 'On or before 15th June', percentage: 15, amount: totalTax * 0.15 },
        { dueDate: 'On or before 15th September', percentage: 45, amount: totalTax * 0.30 },
        { dueDate: 'On or before 15th December', percentage: 75, amount: totalTax * 0.30 },
        { dueDate: 'On or before 15th March', percentage: 100, amount: totalTax * 0.25 },
    ];

    setResult({
      totalTax,
      installments,
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
                <CardTitle className="font-headline text-2xl">Advance Tax Calculator (India)</CardTitle>
                <CardDescription>Estimate your advance tax liability for FY 2025-26.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                 <CardContent className="space-y-6">
                  {/* Personal Details */}
                  <div className="space-y-4 rounded-md border p-4">
                    <h3 className="font-semibold">Personal Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Age Group</Label>
                          <Select onValueChange={(val) => setValue('ageGroup', val as FormValues['ageGroup'])} defaultValue={ageGroup}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Age" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="below60">Below 60</SelectItem>
                              <SelectItem value="60to80">60 to 80</SelectItem>
                              <SelectItem value="above80">Above 80</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Occupation</Label>
                           <Select onValueChange={(val) => setValue('occupationType', val as FormValues['occupationType'])} defaultValue={watch('occupationType')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Occupation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="salaried">Salaried</SelectItem>
                              <SelectItem value="business">Business/Profession</SelectItem>
                              <SelectItem value="pensioner">Pensioner</SelectItem>
                              <SelectItem value="other">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                    </div>
                  </div>

                  {/* Income Details */}
                  <div className="space-y-4 rounded-md border p-4">
                    <h3 className="font-semibold">Income Details (Annual)</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="salaryIncome">Salary Income (₹)</Label>
                            <Input id="salaryIncome" type="number" step="0.01" {...register('salaryIncome')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="businessIncome">Business/Professional Income (₹)</Label>
                            <Input id="businessIncome" type="number" step="0.01" {...register('businessIncome')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pensionIncome">Pension Income (₹)</Label>
                            <Input id="pensionIncome" type="number" step="0.01" {...register('pensionIncome')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otherIncome">Other Income (₹)</Label>
                            <Input id="otherIncome" type="number" step="0.01" {...register('otherIncome')} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="agriculturalIncome">Agricultural Income (₹)</Label>
                            <Input id="agriculturalIncome" type="number" step="0.01" {...register('agriculturalIncome')} />
                            <p className="text-xs text-muted-foreground">Exempt from tax, but used for rate calculation in Old Regime.</p>
                        </div>
                    </div>
                  </div>

                  {/* Regime Selection */}
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
                    <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-semibold">Old Regime Deductions</h3>
                        <div className="space-y-2">
                          <Label htmlFor="deductions80c">Deductions (80C, 80D, HRA etc.) (₹)</Label>
                          <Input id="deductions80c" type="number" step="0.01" {...register('deductions80c')} />
                          {errors.deductions80c && <p className="text-destructive text-sm">{errors.deductions80c.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Standard Deduction</Label>
                          <Input type="text" value="₹50,000" disabled />
                        </div>
                    </div>
                  )}

                  {taxRegime === 'new' && (
                     <div className="space-y-2 rounded-md border p-4">
                        <h3 className="font-semibold">New Regime Deductions</h3>
                        <Label>Standard Deduction</Label>
                        <Input type="text" value="₹75,000" disabled />
                     </div>
                  )}
                  
                  {taxRegime === 'custom' && (
                    <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-semibold">Custom Tax Configuration</h3>
                        
                        <div className="space-y-2">
                           <Label>Custom Tax Slabs</Label>
                           {fields.map((field, index) => (
                              <div key={field.id} className="flex items-center gap-2">
                                   <Input 
                                     type={watch(`customSlabs.${index}.limit`) === Infinity ? "text" : "number"}
                                     placeholder="Up to Amount (₹)" 
                                     {...register(`customSlabs.${index}.limit`)}
                                     disabled={watch(`customSlabs.${index}.limit`) === Infinity}
                                     value={watch(`customSlabs.${index}.limit`) === Infinity ? "Infinity" : watch(`customSlabs.${index}.limit`)}
                                   />
                                   <Input type="number" placeholder="Rate (%)" {...register(`customSlabs.${index}.rate`)} />
                                   {index > 0 && <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>}
                              </div>
                           ))}
                           <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => append({ limit: 0, rate: 0 })}>Add Slab</Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => append({ limit: Infinity, rate: 0 })}>Add Final Slab</Button>
                           </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customStandardDeduction">Custom Standard Deduction (₹)</Label>
                            <Input id="customStandardDeduction" type="number" {...register('customStandardDeduction')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customRebateLimit">Custom Tax Rebate Limit (₹)</Label>
                            <Input id="customRebateLimit" type="number" placeholder="Taxable income limit for rebate" {...register('customRebateLimit')} />
                        </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Advance Tax</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Advance Tax Liability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center border-b pb-4">
                        <p className="text-sm text-muted-foreground">Total Estimated Tax for the Year</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(result.totalTax)}</p>
                    </div>
                    {result.totalTax > 0 && result.installments.length === 0 && (
                        <p className="text-center text-muted-foreground pt-4">Your advance tax liability is less than ₹10,000. No advance tax is due.</p>
                    )}
                    {result.totalTax === 0 && (
                         <p className="text-center text-muted-foreground pt-4">Tax rebate applied. No advance tax is due.</p>
                    )}
                    {result.installments.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Installment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.installments.map((inst, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="font-medium">{inst.dueDate}</div>
                                            <div className="text-xs text-muted-foreground">Cumulative {inst.percentage}% of total tax</div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(inst.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated advance tax for the year is ${formatCurrency(result.totalTax)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Advance Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Advance tax is the income tax paid in advance during the financial year instead of in a lump sum at year-end. It is applicable if your total tax liability for the year is ₹10,000 or more. This prevents a large tax burden at the end of the year and helps the government with a steady flow of revenue.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Who should pay Advance Tax?</h3>
                  <p>Any person—including salaried individuals, freelancers, and businesses—whose estimated tax liability for the financial year is ₹10,000 or more is required to pay advance tax. Senior citizens (aged 60 years or more) not having any income from business or profession are exempt from paying advance tax.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">Old vs. New Tax Regime</h3>
                  <p>The choice of tax regime significantly impacts your tax calculation. The Old Regime allows for various deductions (like 80C, 80D, HRA), while the New Regime offers different slab rates but forgoes most deductions. A tax rebate u/s 87A makes the final tax zero if your taxable income is below a certain threshold in both regimes. Choose the one that is more beneficial for you.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What happens if I miss a payment?</AccordionTrigger>
                      <AccordionContent>
                       If you fail to pay, or pay less than the required amount of advance tax in any installment, you will be liable to pay interest under sections 234B (for non-payment or short payment) and 234C (for deferment of installments) of the Income Tax Act.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Can I adjust the amount in subsequent installments?</AccordionTrigger>
                      <AccordionContent>
                       Yes. If your estimated income changes during the year, you can revise your advance tax in the remaining installments to ensure you meet the required payment percentages by each due date.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>How do I pay Advance Tax?</AccordionTrigger>
                        <AccordionContent>
                        You can pay advance tax online through the Income Tax Department's e-payment portal using Challan 280.
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
