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
  percentage: z.coerce.number().min(0, "Percentage must be positive"),
  totalValue: z.coerce.number().min(0, "Total value must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    resultValue: number;
    percentage: number;
    totalValue: number;
};

export default function PercentageCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      percentage: undefined,
      totalValue: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const resultValue = (data.percentage / 100) * data.totalValue;
    setResult({
        resultValue: parseFloat(resultValue.toFixed(2)),
        percentage: data.percentage,
        totalValue: data.totalValue,
    });
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
                            <CardTitle className="font-headline text-2xl">Percentage Calculator</CardTitle>
                            <CardDescription>Calculate a percentage of a number.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="percentage">What is [X]%</Label>
                                    <Input id="percentage" type="number" step="0.01" placeholder="e.g., 20" {...register('percentage')} />
                                    {errors.percentage && <p className="text-destructive text-sm">{errors.percentage.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalValue">of [Y]?</Label>
                                    <Input id="totalValue" type="number" step="0.01" placeholder="e.g., 150" {...register('totalValue')} />
                                    {errors.totalValue && <p className="text-destructive text-sm">{errors.totalValue.message}</p>}
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
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.resultValue}</div>
                                <div className="text-lg text-muted-foreground">
                                   {result.percentage}% of {result.totalValue} is {result.resultValue}.
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`${result.percentage}% of ${result.totalValue} is ${result.resultValue}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Percentages</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          A percentage is a number or ratio expressed as a fraction of 100. It is often denoted using the percent sign, "%". This calculator helps you find a percentage of a given number quickly and easily.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              Result = (Percentage / 100) * Total Value
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What are percentages used for?</AccordionTrigger>
                              <AccordionContent>
                                  Percentages are used everywhere, from calculating discounts in stores and interest rates at banks to understanding statistics in news reports and figuring out tips at restaurants.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>How do I calculate a percentage increase or decrease?</AccordionTrigger>
                              <AccordionContent>
                                This calculator is for finding a simple percentage. For percentage change, the formula is: ((New Value - Original Value) / Original Value) * 100. We might add a dedicated calculator for that soon!
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
                        <Link href="/gpa-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">GPA Calculator</p>
                        </Link>
                        <Link href="/cgpa-to-percentage-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">CGPA to Percentage</p>
                        </Link>
                        <Link href="/semester-grade-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Semester Grade</p>
                        </Link>
                         <Link href="/percentage-change-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Percentage Change</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
