
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anniversary Calculator - Track Milestones',
  description: 'Calculate the duration of a relationship or event in years, months, and days. Find out the dates of your upcoming major milestones.',
};

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
import { Home, Gift, Info } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { differenceInYears, differenceInMonths, differenceInDays, format, addYears } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  anniversaryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    years: number;
    months: number;
    days: number;
    milestones: { year: number, date: string }[];
};

export default function AnniversaryCalculatorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anniversaryDate: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const anniversaryDate = new Date(data.anniversaryDate);
    const today = new Date();
    
    if (anniversaryDate > today) {
        form.setError('anniversaryDate', { type: 'custom', message: 'Anniversary date must be in the past.' });
        setResult(null);
        return;
    }

    const years = differenceInYears(today, anniversaryDate);
    let months = differenceInMonths(today, anniversaryDate) % 12;
    
    const tempDateForDays = new Date(anniversaryDate);
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

    const milestoneYears = [1, 5, 10, 15, 20, 25, 30, 40, 50];
    const milestones = milestoneYears
      .filter(milestoneYear => milestoneYear > years)
      .map(milestoneYear => ({
        year: milestoneYear,
        date: format(addYears(anniversaryDate, milestoneYear), 'MMMM d, yyyy'),
      }))
      .slice(0, 5); // Show next 5 milestones

    setResult({
        years,
        months,
        days,
        milestones,
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
                            <CardTitle className="font-headline text-2xl">Anniversary & Milestone Calculator</CardTitle>
                            <CardDescription>Calculate the duration of a relationship or event and see upcoming milestones.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="anniversaryDate">Your Anniversary Date</Label>
                                    <p className="text-xs text-muted-foreground">Enter the date your anniversary is celebrated on.</p>
                                    <Input id="anniversaryDate" type="date" {...register('anniversaryDate')} />
                                    {errors.anniversaryDate && <p className="text-destructive text-sm">{errors.anniversaryDate.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                       <div className="space-y-8">
                            <Card className="w-full bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="font-headline">Current Duration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-center">
                                    <Gift className="mx-auto size-12 text-primary" />
                                    <p className='text-center text-3xl text-foreground font-bold'>
                                      {result.years} years, {result.months} months, and {result.days} days
                                    </p>
                                </CardContent>
                                 <CardFooter>
                                    <SharePanel resultText={`It's been ${result.years} years, ${result.months} months, and ${result.days} days!`} />
                                </CardFooter>
                            </Card>

                             {result.milestones.length > 0 && (
                                <Card className="w-full bg-secondary">
                                    <CardHeader>
                                        <CardTitle className="font-headline">Upcoming Milestones</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableBody>
                                                {result.milestones.map((milestone) => (
                                                    <TableRow key={milestone.year}>
                                                        <TableCell className="font-medium">{milestone.year}th Anniversary</TableCell>
                                                        <TableCell className="text-right">{milestone.date}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                       </div>
                    )}
                </div>
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Info className="size-5" /> How It Works</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            This calculator celebrates your special dates by calculating the elapsed time since your anniversary and showing you when your next big milestones are. It's perfect for wedding anniversaries, relationship milestones, work anniversaries, or any other significant date you want to track.
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How is the duration calculated?</AccordionTrigger>
                                <AccordionContent>
                                Using the date of your anniversary, the calculator determines the total years, months, and days that have passed until today. The calculation is done using precise date functions that account for leap years and the varying number of days in each month.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>What are milestones?</AccordionTrigger>
                                <AccordionContent>
                                    Milestones are significant markers of time, like the 1st, 5th, 10th, 25th, and 50th anniversaries. This calculator projects forward to find the dates of your next 5 major milestones, helping you plan ahead for celebrations.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>Can I use this for work anniversaries?</AccordionTrigger>
                                <AccordionContent>
                                Absolutely! This calculator is versatile and can be used to track the duration of any significant event, including your tenure at a company.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
                 <Card className="mt-8">
                    <CardHeader>
                    <CardTitle>Related Calculators</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/age-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Age Calculator</p>
                        </Link>
                        <Link href="/date-duration-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Date Duration Calculator</p>
                        </Link>
                         <Link href="/countdown-timer-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Countdown Timer</p>
                        </Link>
                         <Link href="/sleep-cycle-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Sleep Cycle Calculator</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
