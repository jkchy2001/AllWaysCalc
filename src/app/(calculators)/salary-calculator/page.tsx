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
  ctc: z.coerce.number().min(1, 'CTC must be a positive number.'),
  bonus: z.coerce.number().min(0, 'Bonus must be a positive number.').optional(),
  deductions80c: z.coerce.number().min(0, 'Deductions must be a positive number.').optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  takeHomeSalary: number;
  monthlyGross: number;
  monthlyDeductions: number;
  monthlyIncomeTax: number;
  monthlyPf: number;
  monthlyPt: number;
  ctc: number;
};

export default function SalaryCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ctc: undefined,
      bonus: 0,
      deductions80c: 0,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const calculateTaxNewRegime = (taxableIncome: number): number => {
    let tax = 0;
    const slabs = [
      { limit: 300000, rate: 0 },
      { limit: 600000, rate: 0.05 },
      { limit: 900000, rate: 0.10 },
      { limit: 1200000, rate: 0.15 },
      { limit: 1500000, rate: 0.20 },
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
    const { ctc, bonus = 0, deductions80c = 0 } = data;

    // Standard assumptions: Basic is 40% of CTC, HRA is 50% of Basic.
    const basicSalary = ctc * 0.40;
    const hra = basicSalary * 0.50;
    
    const employerPf = basicSalary * 0.12;
    const employeePf = basicSalary * 0.12;
    
    // Gross salary is CTC minus employer's contributions
    const grossSalary = ctc - employerPf;
    
    // Standard deduction under new regime
    const standardDeduction = 50000;
    
    // Professional tax (capped at 2500 annually)
    const annualProfessionalTax = 2500;
    
    const taxableIncome = grossSalary - standardDeduction - annualProfessionalTax;
    
    let taxAmount = calculateTaxNewRegime(taxableIncome);
    
    // Rebate under section 87A for new regime
    if (taxableIncome <= 700000) {
      taxAmount = 0;
    }

    const healthAndEducationCess = taxAmount * 0.04;
    const totalAnnualTax = taxAmount + healthAndEducationCess;
    
    const annualDeductions = totalAnnualTax + employeePf + annualProfessionalTax;
    const takeHomeAnnual = grossSalary - annualDeductions;

    setResult({
      takeHomeSalary: takeHomeAnnual / 12,
      monthlyGross: grossSalary / 12,
      monthlyDeductions: annualDeductions / 12,
      monthlyIncomeTax: totalAnnualTax / 12,
      monthlyPf: employeePf / 12,
      monthlyPt: annualProfessionalTax / 12,
      ctc: ctc,
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
                <CardTitle className="font-headline text-2xl">Salary Calculator (CTC to Take-Home)</CardTitle>
                <CardDescription>Estimate your net monthly salary from your annual CTC based on the new tax regime. Understand the various components and deductions.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctc">Annual CTC (Cost to Company) (₹)</Label>
                     <p className="text-xs text-muted-foreground">Your total annual salary package including all benefits and contributions from the employer.</p>
                    <Input id="ctc" type="number" {...register('ctc')} />
                    {errors.ctc && <p className="text-destructive text-sm">{errors.ctc.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bonus">Annual Bonus (if any) (₹)</Label>
                    <p className="text-xs text-muted-foreground">Any performance bonus or other variable pay not included in the monthly salary.</p>
                    <Input id="bonus" type="number" {...register('bonus')} />
                     {errors.bonus && <p className="text-destructive text-sm">{errors.bonus.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deductions80c">Total Annual Tax Deductions (80C, 80D etc.) (₹)</Label>
                    <p className="text-xs text-muted-foreground">Note: Most deductions are not applicable under the New Tax Regime, which is used for this calculation.</p>
                    <Input id="deductions80c" type="number" {...register('deductions80c')} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate Take-Home Salary</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Salary Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <span className='font-bold'>Monthly Take-Home:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(result.takeHomeSalary)}</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Gross Monthly Salary:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.monthlyGross)}</span>
                        </div>
                       <div className="flex justify-between">
                          <span>Total Monthly Deductions:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.monthlyDeductions)}</span>
                      </div>
                       <div className="flex justify-between pl-4">
                          <span>Income Tax:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.monthlyIncomeTax)}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                          <span>Employee PF:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.monthlyPf)}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                          <span>Professional Tax:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.monthlyPt)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`With a CTC of ${formatCurrency(result.ctc)}, my estimated take-home salary is ${formatCurrency(result.takeHomeSalary)} per month.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Your Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               This calculator helps you decode your salary slip by estimating your in-hand salary from your Cost-to-Company (CTC) package. It considers standard deductions like Provident Fund (PF), Professional Tax, and Income Tax (calculated under the New Tax Regime by default).
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Assumptions Made</h3>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>Basic Salary is assumed to be 40% of CTC.</li>
                    <li>Income Tax is calculated using the slabs for the New Tax Regime (FY 2023-24).</li>
                    <li>Provident Fund (PF) is calculated at 12% of Basic Salary for both employee and employer.</li>
                    <li>Standard Deduction of ₹50,000 is applied.</li>
                    <li>Professional Tax is assumed to be ₹2,500 annually.</li>
                    <li>This calculator provides an estimate. Your actual take-home salary may vary based on your company's specific salary structure and policies.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is the difference between CTC and Gross Salary?</AccordionTrigger>
                      <AccordionContent>
                       CTC (Cost to Company) is the total amount an employer spends on an employee, including contributions like the employer's share of PF. Gross Salary is your salary before deductions like income tax and your employee PF contribution, but after factoring out the employer's PF share.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Why is the New Tax Regime used by default?</AccordionTrigger>
                      <AccordionContent>
                       Starting from the financial year 2023-24, the New Tax Regime is the default option for all taxpayers. It generally offers lower tax rates but does not allow for most common tax deductions (like 80C, HRA, etc.), except for the standard deduction.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                      <AccordionTrigger>What are the key components of CTC?</AccordionTrigger>
                      <AccordionContent>
                       A CTC package typically includes: Basic Salary, House Rent Allowance (HRA), Special Allowances, Employer's PF Contribution, and may also include Gratuity, Bonus, and other benefits.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Calculators</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/income-tax-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Income Tax Calculator</p>
              </Link>
              <Link href="/hra-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">HRA Calculator</p>
              </Link>
              <Link href="/tds-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">TDS Calculator</p>
              </Link>
               <Link href="/gratuity-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Gratuity Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
