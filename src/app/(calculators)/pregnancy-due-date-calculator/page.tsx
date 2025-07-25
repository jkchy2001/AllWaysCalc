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
import { Home, Baby } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { addDays, differenceInWeeks, format } from 'date-fns';

const formSchema = z.object({
  lmp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  cycleLength: z.coerce.number().int().min(20).max(45).default(28),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    dueDate: string;
    gestationalAge: number; // in weeks
    conceptionDate: string;
    firstTrimesterEnd: string;
    secondTrimesterEnd: string;
};

export default function PregnancyDueDateCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lmp: format(new Date(), 'yyyy-MM-dd'),
      cycleLength: 28,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const lmpDate = new Date(data.lmp);
    const cycleAdjustment = data.cycleLength - 28;
    
    const dueDate = addDays(lmpDate, 280 + cycleAdjustment);
    const conceptionDate = addDays(lmpDate, 14 + cycleAdjustment);
    const gestationalAge = differenceInWeeks(new Date(), lmpDate);
    const firstTrimesterEnd = addDays(lmpDate, 98); // 14 weeks
    const secondTrimesterEnd = addDays(lmpDate, 196); // 28 weeks

    setResult({
      dueDate: format(dueDate, 'MMMM d, yyyy'),
      gestationalAge: gestationalAge,
      conceptionDate: format(conceptionDate, 'MMMM d, yyyy'),
      firstTrimesterEnd: format(firstTrimesterEnd, 'MMMM d, yyyy'),
      secondTrimesterEnd: format(secondTrimesterEnd, 'MMMM d, yyyy'),
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
                            <CardTitle className="font-headline text-2xl">Pregnancy Due Date Calculator</CardTitle>
                            <CardDescription>Estimate your baby's due date and key milestones.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lmp">First Day of Last Menstrual Period (LMP)</Label>
                                    <Input id="lmp" type="date" {...register('lmp')} />
                                    {errors.lmp && <p className="text-destructive text-sm">{errors.lmp.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="cycleLength">Average Cycle Length (in days)</Label>
                                    <Input id="cycleLength" type="number" {...register('cycleLength')} />
                                    {errors.cycleLength && <p className="text-destructive text-sm">{errors.cycleLength.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Due Date</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Pregnancy Journey</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center border-b pb-4">
                                    <p className="text-sm text-muted-foreground">Estimated Due Date</p>
                                    <p className="text-3xl font-bold text-primary">{result.dueDate}</p>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Current Gestational Age:</span>
                                        <span className="font-medium text-foreground">~{result.gestationalAge} weeks</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estimated Conception Date:</span>
                                        <span className="font-medium text-foreground">{result.conceptionDate}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span>End of 1st Trimester:</span>
                                        <span className="font-medium text-foreground">{result.firstTrimesterEnd}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span>End of 2nd Trimester:</span>
                                        <span className="font-medium text-foreground">{result.secondTrimesterEnd}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My estimated due date is ${result.dueDate}!`} />
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
                        This calculator estimates your pregnancy due date based on the first day of your last menstrual period (LMP). This is a standard method used by healthcare providers.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Method Used (Naegele's Rule)</h3>
                          <p>The calculation is based on a simple formula: the due date is 280 days (or 40 weeks) from the first day of your LMP. We also adjust this calculation based on your average menstrual cycle length, as a cycle shorter or longer than the average 28 days can shift the ovulation date.</p>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this date accurate?</AccordionTrigger>
                              <AccordionContent>
                                This is an estimate. Only about 5% of babies are born on their exact due date. The most accurate due date is typically determined by an ultrasound scan, especially in the first trimester.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What if I don't know my LMP or have irregular cycles?</AccordionTrigger>
                              <AccordionContent>
                              If your cycles are irregular or you don't know your LMP, this calculator will be less accurate. In this case, an early ultrasound is the best way to determine your baby's gestational age and due date.
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
