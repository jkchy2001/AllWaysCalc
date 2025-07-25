'use client';

import { useState, useEffect } from 'react';
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
import { Home, BedDouble } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { addMinutes, subMinutes, format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  mode: z.enum(['wakeUpAt', 'goToBedNow']),
  wakeUpTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  times: string[];
  mode: 'wakeUpAt' | 'goToBedNow';
  wakeUpTime?: string;
};

const SLEEP_CYCLE_MINUTES = 90;
const TIME_TO_FALL_ASLEEP_MINUTES = 14;

export default function SleepCycleCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'wakeUpAt',
      wakeUpTime: '07:00',
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const mode = watch('mode');

  useEffect(() => {
    // Re-submit form when mode changes for "go to bed now"
    if (mode === 'goToBedNow') {
      handleSubmit(onSubmit)();
    }
  }, [mode, handleSubmit]);

  const onSubmit = (data: FormValues) => {
    const calculatedTimes: string[] = [];
    const cyclesToCalculate = [6, 5, 4, 3]; // 9h, 7.5h, 6h, 4.5h of sleep

    if (data.mode === 'wakeUpAt' && data.wakeUpTime) {
      const [hours, minutes] = data.wakeUpTime.split(':').map(Number);
      const wakeUpDate = new Date();
      wakeUpDate.setHours(hours, minutes, 0, 0);

      cyclesToCalculate.forEach(cycles => {
        const totalSleepMinutes = cycles * SLEEP_CYCLE_MINUTES;
        const bedTime = subMinutes(wakeUpDate, totalSleepMinutes + TIME_TO_FALL_ASLEEP_MINUTES);
        calculatedTimes.push(format(bedTime, 'h:mm a'));
      });
      
      setResult({ times: calculatedTimes, mode: 'wakeUpAt', wakeUpTime: format(wakeUpDate, 'h:mm a') });

    } else if (data.mode === 'goToBedNow') {
      const now = new Date();
      
      cyclesToCalculate.forEach(cycles => {
        const totalSleepMinutes = cycles * SLEEP_CYCLE_MINUTES;
        const wakeTime = addMinutes(now, totalSleepMinutes + TIME_TO_FALL_ASLEEP_MINUTES);
        calculatedTimes.push(format(wakeTime, 'h:mm a'));
      });
      setResult({ times: calculatedTimes, mode: 'goToBedNow' });
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
                <CardTitle className="font-headline text-2xl">Sleep Cycle Calculator</CardTitle>
                <CardDescription>Wake up feeling refreshed by aligning with your sleep cycles.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <RadioGroup
                        defaultValue="wakeUpAt"
                        className="grid grid-cols-2 gap-4"
                        value={mode}
                        onValueChange={(value) => form.setValue('mode', value as 'wakeUpAt' | 'goToBedNow')}
                    >
                        <div>
                            <RadioGroupItem value="wakeUpAt" id="wakeUpAt" className="peer sr-only" />
                            <Label htmlFor="wakeUpAt" className="flex items-center text-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">I want to wake up at...</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="goToBedNow" id="goToBedNow" className="peer sr-only" />
                            <Label htmlFor="goToBedNow" className="flex items-center text-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">If I go to bed now...</Label>
                        </div>
                    </RadioGroup>
                  
                    {mode === 'wakeUpAt' && (
                        <div className="space-y-2">
                            <Label htmlFor="wakeUpTime">Desired Wake-up Time</Label>
                            <Input id="wakeUpTime" type="time" {...register('wakeUpTime')} />
                        </div>
                    )}

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                    {mode === 'wakeUpAt' ? 'Calculate Bedtimes' : 'Calculate Wake-up Times'}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Sleep Schedule</CardTitle>
                   <CardDescription className="text-center">
                    {result.mode === 'wakeUpAt'
                      ? `To wake up refreshed at ${result.wakeUpTime}, you should go to bed at one of the following times:`
                      : "If you go to bed now, try to wake up at one of these times for the best results:"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                        {result.times.map((time, index) => (
                            <div key={index} className="p-3 bg-background rounded-lg shadow-sm">
                                <div className="text-xl font-bold text-primary">{time}</div>
                                <div className="text-xs text-muted-foreground">{9 - index * 1.5} hrs sleep</div>
                            </div>
                        ))}
                    </div>
                     <p className="text-xs text-center text-muted-foreground pt-2">
                        These times are based on an average 90-minute sleep cycle and assume it takes about 14 minutes to fall asleep.
                    </p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My recommended bedtime is around ${result.times[1]} for a great night's sleep!`} />
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
                Waking up in the middle of a sleep cycle can leave you feeling groggy and tired. This calculator helps you schedule your sleep so you wake up at the end of a cycle, promoting a more natural and refreshing start to your day.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">The Science of Sleep Cycles</h3>
                  <p>A full sleep cycle typically lasts around 90 minutes, during which you move through different stages of sleep, from light sleep to deep sleep and REM (Rapid Eye Movement). Completing 4 to 6 of these full cycles is ideal for most adults.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Why do I feel tired even after 8 hours of sleep?</AccordionTrigger>
                      <AccordionContent>
                       If you wake up during a deep sleep stage, you are more likely to feel groggy, a phenomenon known as sleep inertia. By timing your alarm to coincide with the end of a sleep cycle, when you are in a lighter stage of sleep, you can minimize this effect.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Is 14 minutes an exact time to fall asleep?</AccordionTrigger>
                      <AccordionContent>
                        No, 14 minutes is the average time it takes for a healthy adult to fall asleep. Your personal time may vary. If you know it takes you longer or shorter, you can mentally adjust the suggested times accordingly.
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
