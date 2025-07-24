
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
import { Home, Clock } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  distance: z.coerce.number().min(1, 'Distance must be positive.'),
  speed: z.coerce.number().min(1, 'Average speed must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  timeInHours: number;
};

export default function TravelTimeEstimatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distance: 100,
      speed: 60,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const timeInHours = data.distance / data.speed;
    setResult({
      timeInHours,
    });
  };
  
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    let result = '';
    if (h > 0) result += `${h} hour${h > 1 ? 's' : ''} `;
    if (m > 0) result += `${m} minute${m > 1 ? 's' : ''}`;
    return result.trim();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Online Travel Time Estimator</CardTitle>
                <CardDescription>Estimate how long a trip will take based on distance and average speed.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Total Distance (km)</Label>
                    <p className="text-xs text-muted-foreground">Enter the total length of your journey.</p>
                    <Input id="distance" type="number" step="0.1" {...register('distance')} />
                    {errors.distance && <p className="text-destructive text-sm">{errors.distance.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="speed">Average Speed (km/h)</Label>
                    <p className="text-xs text-muted-foreground">Enter your expected average speed for the trip.</p>
                    <Input id="speed" type="number" step="0.1" {...register('speed')} />
                    {errors.speed && <p className="text-destructive text-sm">{errors.speed.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Estimate Time</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Estimated Travel Time</CardTitle>
                  <CardDescription>This is the calculated duration for your journey.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Clock className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                      {formatHours(result.timeInHours)}
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated travel time is ${formatHours(result.timeInHours)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
           <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline">How Travel Time is Estimated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                 This calculator uses the fundamental relationship between speed, distance, and time to provide an estimate for the duration of a journey.
                </p>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What formula is used?</AccordionTrigger>
                    <AccordionContent>
                      The calculation is based on the classic formula:
                      <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                          Time = Distance / Speed
                        </code>
                      </pre>
                      The result is given in hours and minutes.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is this estimate accurate?</AccordionTrigger>
                    <AccordionContent>
                      This is a simple estimate. Real-world travel time can be affected by numerous factors, including traffic conditions, weather, stops for breaks or fuel, and variations in speed. The "Average Speed" you enter is the most critical factor in getting a reasonable estimate.
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-3">
                    <AccordionTrigger>How can I estimate my average speed?</AccordionTrigger>
                    <AccordionContent>
                      Consider the type of roads you'll be traveling on. For highway driving, your average speed might be close to the speed limit. For city driving with frequent stops, it will be much lower. If your trip involves a mix, you might need to calculate segments separately or use a blended average.
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
                <Link href="/distance-fuel-cost-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Distance & Fuel Cost</p>
                </Link>
                <Link href="/speed-converter" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Speed Converter</p>
                </Link>
                 <Link href="/speed-distance-time-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Speed, Distance, Time</p>
                </Link>
                 <Link href="/acceleration-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Acceleration</p>
                </Link>
              </CardContent>
            </Card>

        </div>
      </main>
    </div>
  );
}
