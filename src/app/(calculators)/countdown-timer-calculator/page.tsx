
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
import { Home, Timer } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  eventName: z.string().optional(),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date and time.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export default function CountdownTimerCalculatorPage() {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: 'New Year\'s Day',
      targetDate: `${new Date().getFullYear() + 1}-01-01T00:00`,
    },
  });

  const { register, handleSubmit, watch } = form;
  const eventName = watch('eventName');

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
        const difference = targetDate.getTime() - new Date().getTime();
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            setTimeLeft({ days, hours, minutes, seconds });
            setIsFinished(false);
        } else {
            setTimeLeft(null);
            setIsFinished(true);
        }
    }

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const onSubmit = (data: FormValues) => {
    const newTargetDate = new Date(data.targetDate);
    setTargetDate(newTargetDate);
  };
  
  // Trigger initial calculation
  useEffect(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit]);


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
                            <CardTitle className="font-headline text-2xl">Countdown Timer</CardTitle>
                            <CardDescription>Set a timer for an upcoming event.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="eventName">Event Name (optional)</Label>
                                    <Input id="eventName" placeholder="e.g., My Birthday" {...register('eventName')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="targetDate">Date and Time</Label>
                                    <Input id="targetDate" type="datetime-local" {...register('targetDate')} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Start Countdown</Button>
                            </CardFooter>
                        </form>
                    </Card>

                   {(timeLeft || isFinished) && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline text-center">{eventName || 'Countdown'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                               {isFinished ? (
                                    <div className="text-4xl font-bold text-primary">The event has started!</div>
                               ) : timeLeft && (
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="p-4 bg-background rounded-lg">
                                            <div className="text-4xl font-bold text-primary">{timeLeft.days}</div>
                                            <div className="text-sm text-muted-foreground">Days</div>
                                        </div>
                                         <div className="p-4 bg-background rounded-lg">
                                            <div className="text-4xl font-bold text-primary">{timeLeft.hours}</div>
                                            <div className="text-sm text-muted-foreground">Hours</div>
                                        </div>
                                         <div className="p-4 bg-background rounded-lg">
                                            <div className="text-4xl font-bold text-primary">{timeLeft.minutes}</div>
                                            <div className="text-sm text-muted-foreground">Minutes</div>
                                        </div>
                                         <div className="p-4 bg-background rounded-lg">
                                            <div className="text-4xl font-bold text-primary">{timeLeft.seconds}</div>
                                            <div className="text-sm text-muted-foreground">Seconds</div>
                                        </div>
                                    </div>
                               )}
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`Counting down to ${eventName || 'an event'}!`} />
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
                        This calculator measures the exact time remaining until a specific event you set. It continuously updates every second to give you a live countdown.
                      </p>
                       <div className="space-y-4">
                            <div>
                                <h3 className="font-bold font-headline">Methodology</h3>
                                <p>The calculator takes your target date and time and subtracts the current system time. This difference is then broken down into days, hours, minutes, and seconds. A timer is used to re-calculate this difference every second, creating the live countdown effect.</p>
                            </div>
                        </div>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
