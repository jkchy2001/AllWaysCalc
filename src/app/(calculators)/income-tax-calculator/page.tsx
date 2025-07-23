
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
  
  maxRebateAmountOld: z.coerce.number().min(0).optional(),
  maxRebateAmountNew: z.coerce.number().min(0).optional(),

  customSlabs: z.array(taxSlabSchema).optional(),
  customStandardDeduction: z.coerce.number().min(0).optional(),
  customMaxRebateAmount: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  taxableIncome: number;
  taxAmount: number;
  surcharge: number;
  healthAndEducationCess: number;
  totalTax: number;
  slabWiseTax: { slab: string; tax: number }[];
  rebateApplied: boolean;
};

const newRegimeSlabs = [
  { limit: 400000, rate: 0 },
  { limit: 800000, rate: 5 },
  { limit: 1200000, rate: 10 },
  { limit: 1600000, rate: 15 },
  { limit: 2000000, rate: 20 },
  { limit: 2400000, rate: 25 },
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


export default function IncomeTaxCalculatorPage() {
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
      maxRebateAmountOld: 12500,
      maxRebateAmountNew: 25000,
      customSlabs: [{ limit: 300000, rate: 5 }, { limit: 700000, rate: 10 }, { limit: Infinity, rate: 20 }],
      customStandardDeduction: 75000,
      customMaxRebateAmount: 25000,
    },
  });

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customSlabs",
  });

  const taxRegime = watch('taxRegime');
  const ageGroup = watch('ageGroup');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateTax = (taxableIncome: number, regime: 'old' | 'new' | 'custom', ageGroup: FormValues['ageGroup'], customSlabs: {limit: number, rate: number}[]): { tax: number, slabWiseTax: { slab: string, tax: number }[]} => {
    let tax = 0;
    const slabWiseTax: { slab: string; tax: number }[] = [];
    
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
        const taxInSlab = taxableInSlab * slab.rate;
        tax += taxInSlab;
        
        if (taxInSlab > 0 || (slab.rate === 0 && taxableInSlab > 0)) {
            const slabLabel = lastLimit === 0 
                ? `Up to ${formatCurrency(slab.limit)}` 
                : slab.limit === Infinity 
                    ? `Above ${formatCurrency(lastLimit)}`
                    : `${formatCurrency(lastLimit + 1)} - ${formatCurrency(slab.limit)}`;
            slabWiseTax.push({ slab: `${slabLabel} @ ${slab.rate * 100}%`, tax: taxInSlab });
        }
      }
      lastLimit = slab.limit;
      if(lastLimit === Infinity) break;
    }
    return { tax, slabWiseTax };
  };

  const onSubmit = (data: FormValues) => {
    const { 
        ageGroup, salaryIncome=0, businessIncome=0, pensionIncome=0, agriculturalIncome=0, otherIncome=0,
        deductions80c, taxRegime, customSlabs = [], customStandardDeduction, customMaxRebateAmount,
        maxRebateAmountNew, maxRebateAmountOld
    } = data;
    
    const grossIncome = salaryIncome + businessIncome + pensionIncome + otherIncome; 
    
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
        applicableDeductions = deductions80c + standardDeduction;
    }

    let taxableIncome = grossIncome - applicableDeductions;
    if (taxableIncome < 0) taxableIncome = 0;

    let finalTaxableIncome = taxableIncome;
    if (taxRegime === 'old' && agriculturalIncome > 5000 && taxableIncome > oldRegimeSlabs[ageGroup][0].limit) {
        finalTaxableIncome += agriculturalIncome;
    }

    let { tax: taxAmount, slabWiseTax } = calculateTax(finalTaxableIncome, taxRegime, ageGroup, customSlabs || []);
    let rebateApplied = false;

    if (taxRegime === 'old' && agriculturalIncome > 5000 && taxableIncome > oldRegimeSlabs[ageGroup][0].limit) {
      const taxOnAgri = calculateTax(agriculturalIncome + oldRegimeSlabs[ageGroup][0].limit, taxRegime, ageGroup, customSlabs).tax;
      taxAmount -= taxOnAgri;
    }

    let surcharge = 0;
    if (taxableIncome > 5000000) {
        if (taxableIncome <= 10000000) surcharge = taxAmount * 0.10;
        else if (taxableIncome <= 20000000) surcharge = taxAmount * 0.15;
        else if (taxableIncome <= 50000000) surcharge = taxAmount * 0.25;
        else surcharge = taxAmount * 0.37;
    }

    let healthAndEducationCess = (taxAmount + surcharge) * 0.04;

    if (taxRegime === 'new' && maxRebateAmountNew && taxAmount > 0 && taxAmount <= maxRebateAmountNew) {
        taxAmount = 0; surcharge = 0; healthAndEducationCess = 0;
        rebateApplied = true;
    } else if (taxRegime === 'old' && maxRebateAmountOld && taxAmount > 0 && taxAmount <= maxRebateAmountOld) {
        taxAmount = 0; surcharge = 0; healthAndEducationCess = 0;
        rebateApplied = true;
    } else if (taxRegime === 'custom' && customMaxRebateAmount && taxAmount > 0 && taxAmount <= customMaxRebateAmount) {
        taxAmount = 0; surcharge = 0; healthAndEducationCess = 0;
        rebateApplied = true;
    }
    
    if (rebateApplied) {
        slabWiseTax = [{ slab: 'Tax Rebate Applied u/s 87A', tax: 0 }];
    }
    
    const totalTax = taxAmount + surcharge + healthAndEducationCess;
    
    setResult({
      taxableIncome,
      taxAmount: taxAmount,
      surcharge,
      healthAndEducationCess: healthAndEducationCess,
      totalTax,
      slabWiseTax,
      rebateApplied
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
                <CardTitle className="font-headline text-2xl">Advanced Income Tax Calculator</CardTitle>
                <CardDescription>Estimate your tax liability for FY 2025-26 with advanced options.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
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
                        <h3 className="font-semibold">Old Regime Options</h3>
                        <div className="space-y-2">
                          <Label htmlFor="deductions80c">Deductions (80C, 80D, HRA etc.) (₹)</Label>
                          <Input id="deductions80c" type="number" step="0.01" {...register('deductions80c')} />
                          {errors.deductions80c && <p className="text-destructive text-sm">{errors.deductions80c.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Standard Deduction</Label>
                          <Input type="text" value="₹50,000" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxRebateAmountOld">Max Rebate Amount (u/s 87A) (₹)</Label>
                            <Input id="maxRebateAmountOld" type="number" {...register('maxRebateAmountOld')} />
                        </div>
                    </div>
                  )}

                  {taxRegime === 'new' && (
                     <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-semibold">New Regime Options</h3>
                        <div>
                          <Label>Standard Deduction</Label>
                          <Input type="text" value="₹75,000" disabled />
                        </div>
                        <div>
                            <Label htmlFor="maxRebateAmountNew">Max Rebate Amount (u/s 87A) (₹)</Label>
                            <Input id="maxRebateAmountNew" type="number" {...register('maxRebateAmountNew')} />
                        </div>
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
                                     type="number"
                                     placeholder="Up to Amount (₹)" 
                                     {...register(`customSlabs.${index}.limit`)}
                                     disabled={watch(`customSlabs.${index}.limit`) === Infinity}
                                     value={watch(`customSlabs.${index}.limit`) === Infinity ? 'Infinity' : form.getValues(`customSlabs.${index}.limit`)}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.toLowerCase() === 'infinity') {
                                            setValue(`customSlabs.${index}.limit`, Infinity);
                                        } else {
                                            setValue(`customSlabs.${index}.limit`, Number(value));
                                        }
                                     }}
                                   />
                                   <Input type="number" placeholder="Rate (%)" {...register(`customSlabs.${index}.rate`)} />
                                   {fields.length > 1 && watch(`customSlabs.${index}.limit`) !== Infinity && <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>}
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
                            <Label htmlFor="customMaxRebateAmount">Custom Max Rebate Amount (₹)</Label>
                            <Input id="customMaxRebateAmount" type="number" {...register('customMaxRebateAmount')} />
                        </div>
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
                     {result.slabWiseTax.length > 0 && !result.rebateApplied && (
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
                     )}
                     {result.rebateApplied && (
                        <p className="text-center text-green-600 font-semibold pt-4">Tax Rebate Applied. No tax is due.</p>
                     )}
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
               This calculator provides an estimate of your income tax liability for FY 2025-26 (AY 2026-27). It supports various income types, age groups, and tax regimes to give you a comprehensive overview.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">How is Tax Calculated?</h3>
                  <p>Your taxable income is first calculated by subtracting eligible deductions (like Standard Deduction, 80C, etc.) from your gross income. This taxable income is then applied to a slab system based on your age and chosen tax regime. The total tax is the sum of the tax calculated for each slab, plus any applicable cess and surcharge.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Old vs. New Tax Regime: What's the difference?</AccordionTrigger>
                      <AccordionContent>
                       The **Old Regime** allows you to claim a wide range of deductions and exemptions (like 80C, HRA). The tax slabs also differ based on age. The Standard Deduction is ₹50,000.<br/><br/>
                       The **New Regime** is the default option and offers different, generally lower, tax slabs but requires you to forgo most common deductions. A Standard Deduction of ₹75,000 is available for salaried individuals and pensioners.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What is a Tax Rebate under Section 87A?</AccordionTrigger>
                      <AccordionContent>
                        A tax rebate is a relief for taxpayers. If your calculated tax liability is below a certain threshold (e.g., up to ₹25,000 in the New Regime for incomes up to ₹7 lakh), your tax payable becomes zero. This calculator allows you to set this rebate amount.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>How is Agricultural Income treated?</AccordionTrigger>
                      <AccordionContent>
                        Agricultural income is exempt from income tax. However, under the Old Regime, if your net agricultural income exceeds ₹5,000, it is added to your total income for the purpose of determining the tax rate applicable to your other income, which can sometimes result in a higher tax liability.
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

    