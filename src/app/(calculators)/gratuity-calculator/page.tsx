
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
  lastSalary: z.coerce.number().min(0, 'Salary must be a positive number.'),
  yearsOfService: z.coerce.number().int().min(1, 'Years of service must be at least 1.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  gratuityAmount: number;
};

export default function GratuityCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastSalary: undefined,
      yearsOfService: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    // If years of service is more than X years and 6 months, it is rounded to X+1 years.
    const years = Math.round(data.yearsOfService);
    const gratuityAmount = (data.lastSalary * years * 15) / 26;
    
    setResult({
      gratuityAmount,
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
                <CardTitle className="font-headline text-2xl">Gratuity Calculator</CardTitle>
                <CardDescription>Estimate your gratuity amount upon leaving a job.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastSalary">Last Drawn Monthly Salary (₹)</Label>
                    <Input id="lastSalary" type="number" step="0.01" {...register('lastSalary')} placeholder="Basic + Dearness Allowance" />
                    {errors.lastSalary && <p className="text-destructive text-sm">{errors.lastSalary.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfService">Years of Service</Label>
                    <Input id="yearsOfService" type="number" step="0.1" {...register('yearsOfService')} />
                    {errors.yearsOfService && <p className="text-destructive text-sm">{errors.yearsOfService.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Gratuity</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Gratuity Calculation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">Estimated Gratuity Amount:</p>
                    <div className="text-4xl font-bold text-primary">{formatCurrency(result.gratuityAmount)}</div>
                    {form.getValues('yearsOfService') < 5 && (
                         <p className="text-sm text-amber-600">Note: Gratuity is typically only payable after 5 years of continuous service.</p>
                    )}
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated gratuity is ${formatCurrency(result.gratuityAmount)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Gratuity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Gratuity is a benefit paid by an employer to an employee for their long-term service. As per the Payment of Gratuity Act, 1972, it is mandatory for employers with 10 or more employees to pay gratuity to employees who have completed at least 5 years of continuous service.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Gratuity = (Last Salary × Years of Service × 15) / 26
                    </code>
                  </pre>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li><b>Last Salary</b> includes your Basic Pay and Dearness Allowance (DA).</li>
                    <li><b>15</b> represents 15 days' salary for each year of service.</li>
                    <li><b>26</b> represents the number of working days in a month.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is the minimum service required for gratuity?</AccordionTrigger>
                      <AccordionContent>
                       An employee is eligible for gratuity only after completing 5 years of continuous service with the same employer.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>How are the years of service calculated?</AccordionTrigger>
                      <AccordionContent>
                       For the purpose of calculation, if an employee has served for more than 6 months in their last year of employment, it is rounded off to the next full year. For example, 7 years and 8 months would be counted as 8 years.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Is there a maximum limit on gratuity?</AccordionTrigger>
                      <AccordionContent>
                       Yes, under the Payment of Gratuity Act, the maximum gratuity amount that can be paid to an employee is ₹20 lakhs. Any amount exceeding this is not exempt from tax.
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
