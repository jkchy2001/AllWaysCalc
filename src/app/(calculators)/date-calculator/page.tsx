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
import { differenceInDays, format, addDays, subDays } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  calculationType: z.enum(['duration', 'add', 'subtract']),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please enter a valid start date." }),
  endDate: z.string().optional(),
  days: z.coerce.number().int().optional(),
}).refine(data => {
    if (data.calculationType === 'duration') return !!data.endDate && !isNaN(Date.parse(data.endDate));
    if (data.calculationType === 'add' || data.calculationType === 'subtract') return data.days !== undefined && data.days > 0;
    return false;
}, {
    message: 'Please fill the required fields for the selected calculation.',
    path: ['calculationType']
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    duration?: { years: number; months: number; days: number; totalDays: number };
    newDate?: string;
};

export default function DateCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationType: 'duration',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      days: 30,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const calculationType = watch('calculationType');

  const onSubmit = (data: FormValues) => {
    const startDate = new Date(data.startDate);

    if (data.calculationType === 'duration' && data.endDate) {
      const endDate = new Date(data.endDate);
      const totalDays = Math.abs(differenceInDays(endDate, startDate));
      const years = Math.floor(totalDays / 365);
      const months = Math.floor((totalDays % 365) / 30);
      const days = totalDays - (years * 365) - (months * 30);
      setResult({ duration: { years, months, days, totalDays } });
    } else if (data.days) {
      if (data.calculationType === 'add') {
        const newDate = addDays(startDate, data.days);
        setResult({ newDate: format(newDate, 'MMMM d, yyyy') });
      } else if (data.calculationType === 'subtract') {
        const newDate = subDays(startDate, data.days);
        setResult({ newDate: format(newDate, 'MMMM d, yyyy') });
      }
    }
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
                            <CardTitle className="font-headline text-2xl">Date Calculator</CardTitle>
                            <CardDescription>Calculate duration between dates or find a new date.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    defaultValue="duration"
                                    className="grid grid-cols-3 gap-4"
                                    onValueChange={(value) => form.setValue('calculationType', value as 'duration' | 'add' | 'subtract')}
                                    {...register('calculationType')}
                                >
                                    <div>
                                        <RadioGroupItem value="duration" id="duration" className="peer sr-only" />
                                        <Label htmlFor="duration" className="flex items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Duration</Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="add" id="add" className="peer sr-only" />
                                        <Label htmlFor="add" className="flex items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Add Days</Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="subtract" id="subtract" className="peer sr-only" />
                                        <Label htmlFor="subtract" className="flex items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Subtract</Label>
                                    </div>
                                </RadioGroup>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input id="startDate" type="date" {...register('startDate')} />
                                </div>
                                
                                {calculationType === 'duration' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input id="endDate" type="date" {...register('endDate')} />
                                    </div>
                                )}

                                {(calculationType === 'add' || calculationType === 'subtract') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="days">{calculationType === 'add' ? 'Days to Add' : 'Days to Subtract'}</Label>
                                        <Input id="days" type="number" placeholder="e.g., 45" {...register('days')} />
                                    </div>
                                )}
                                {errors.calculationType && <p className="text-destructive text-sm">{errors.calculationType.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader><CardTitle className="font-headline">Result</CardTitle></CardHeader>
                            <CardContent className="space-y-4 text-center">
                                {result.duration && (
                                    <>
                                        <div className="text-4xl font-bold text-primary">{result.duration.totalDays.toLocaleString()} Days</div>
                                        <div className="text-lg text-muted-foreground">
                                            Which is {result.duration.years} years, {result.duration.months} months, and {result.duration.days} days.
                                        </div>
                                    </>
                                )}
                                {result.newDate && (
                                    <>
                                       <div className="text-4xl font-bold text-primary">{result.newDate}</div>
                                       <div className="text-lg text-muted-foreground">
                                            Is the resulting date.
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={
                                    result.duration ? 
                                    `The duration is ${result.duration.totalDays} days.` :
                                    `The new date is ${result.newDate}.`
                                } />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader><CardTitle className="font-headline">How It Works</CardTitle></CardHeader>
                  <CardContent>
                      <p className="mb-4">This tool allows you to perform two main types of date calculations: finding the duration between two dates, or adding/subtracting days from a specific date to find a new one.</p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>How is the duration calculated?</AccordionTrigger>
                              <AccordionContent>The duration is calculated by finding the total number of days between the start and end dates. We then provide a simple breakdown into years, months (assuming 30 days/month), and days for easier understanding.</AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Does this account for leap years?</AccordionTrigger>
                              <AccordionContent>Yes, the underlying date functions correctly handle leap years when calculating the total number of days or finding a new date.</AccordionContent>
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
