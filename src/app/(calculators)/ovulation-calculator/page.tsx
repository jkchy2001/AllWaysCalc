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
import { Home, Sparkles } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { addDays, subDays, format } from 'date-fns';

const formSchema = z.object({
  lmp: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  cycleLength: z.coerce.number().int().min(20).max(45).default(28),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    ovulationDate: string;
    fertileWindowStart: string;
    fertileWindowEnd: string;
    nextPeriodDate: string;
};

export default function OvulationCalculatorPage() {
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
    
    // Ovulation is ~14 days before next cycle
    const estimatedOvulationDay = data.cycleLength - 14;
    const ovulationDate = addDays(lmpDate, estimatedOvulationDay);
    
    // Fertile window is ~5 days before ovulation + ovulation day
    const fertileWindowStart = subDays(ovulationDate, 5);
    const fertileWindowEnd = ovulationDate;
    
    const nextPeriodDate = addDays(lmpDate, data.cycleLength);

    setResult({
      ovulationDate: format(ovulationDate, 'MMMM d, yyyy'),
      fertileWindowStart: format(fertileWindowStart, 'MMMM d, yyyy'),
      fertileWindowEnd: format(fertileWindowEnd, 'MMMM d, yyyy'),
      nextPeriodDate: format(nextPeriodDate, 'MMMM d, yyyy'),
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
                            <CardTitle className="font-headline text-2xl">Ovulation Calculator</CardTitle>
                            <CardDescription>Estimate your most fertile days.</CardDescription>
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
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Fertile Window</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Fertile Window</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center border-b pb-4">
                                    <p className="text-sm text-muted-foreground">Estimated Ovulation Date</p>
                                    <p className="text-3xl font-bold text-primary">{result.ovulationDate}</p>
                                </div>
                                <div className="space-y-2 text-center text-muted-foreground">
                                    <p>Your most fertile days are estimated to be between:</p>
                                    <p className="font-medium text-lg text-foreground">{result.fertileWindowStart} and {result.fertileWindowEnd}</p>
                                </div>
                                <div className="text-center text-xs text-muted-foreground pt-2">
                                    Your next period is expected around {result.nextPeriodDate}.
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My estimated fertile window is ${result.fertileWindowStart} - ${result.fertileWindowEnd}.`} />
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
                        This calculator estimates your ovulation date and fertile window based on your menstrual cycle data. Knowing this can help you identify the best time to conceive.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Methodology</h3>
                          <p>Ovulation typically occurs about 14 days before the start of your next period. This calculator finds your next period date based on your cycle length and then counts back 14 days to estimate your ovulation day. The "fertile window" includes the five days leading up to and the day of ovulation, as sperm can survive in the reproductive tract for several days.</p>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this calculator accurate?</AccordionTrigger>
                              <AccordionContent>
                               This is an estimation based on averages. The actual day of ovulation can vary from person to person and even from cycle to cycle. For more accuracy, consider using ovulation predictor kits (OPKs) or tracking basal body temperature.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What if my cycles are irregular?</AccordionTrigger>
                              <AccordionContent>
                              If your cycle length varies significantly, this calculator will be less accurate. It's best to use your average cycle length, but be aware that the actual ovulation day may shift.
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
