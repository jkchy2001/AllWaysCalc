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
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

const formSchema = z.object({
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    years: number;
    months: number;
    days: number;
    totalMonths: number;
    totalDays: number;
};

export default function AgeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    
    const years = differenceInYears(today, birthDate);
    let months = differenceInMonths(today, birthDate) % 12;
    
    // Adjust days calculation
    const tempDateForDays = new Date(birthDate);
    tempDateForDays.setFullYear(tempDateForDays.getFullYear() + years);
    tempDateForDays.setMonth(tempDateForDays.getMonth() + months);
    let days = differenceInDays(today, tempDateForDays);
    
    if (days < 0) {
      months = months -1;
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() -1);
      days = differenceInDays(today, lastMonth);
    }
    if (months < 0) {
      months = 11;
    }

    const totalMonths = differenceInMonths(today, birthDate);
    const totalDays = differenceInDays(today, birthDate);

    setResult({
        years,
        months,
        days,
        totalMonths,
        totalDays,
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
                            <CardTitle className="font-headline text-2xl">Age Calculator</CardTitle>
                            <CardDescription>Find out your exact age in years, months, and days.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">Your Date of Birth</Label>
                                    <Input id="birthDate" type="date" {...register('birthDate')} />
                                    {errors.birthDate && <p className="text-destructive text-sm">{errors.birthDate.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Age</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Age</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center border-b pb-4">
                                    <span className="text-6xl font-bold text-primary">{result.years}</span>
                                    <span className="text-2xl font-semibold"> years old</span>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p className='text-center text-lg text-foreground font-medium'>
                                      {result.years} years, {result.months} months, and {result.days} days
                                    </p>
                                    <div className="flex justify-between">
                                        <span>Total Months:</span>
                                        <span className="font-medium text-foreground">{result.totalMonths.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Days:</span>
                                        <span className="font-medium text-foreground">{result.totalDays.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`I am ${result.years} years, ${result.months} months, and ${result.days} days old!`} />
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
                        This calculator determines the time elapsed from a date of birth to today's date. It provides a detailed breakdown in years, months, and days, as well as a summary in total months and total days.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Method Used</h3>
                          <p>We use the current date and your birth date to calculate the precise difference in time, accounting for variations in the number of days in each month and leap years.</p>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this calculation exact?</AccordionTrigger>
                              <AccordionContent>
                              Yes, the calculation is highly accurate. It's based on the popular and well-tested `date-fns` library for date manipulations.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Can I calculate the age for a future date?</AccordionTrigger>
                              <AccordionContent>
                              This calculator is designed to work with past dates of birth. Calculating for a future date of birth will result in a negative age, which this tool does not support.
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
