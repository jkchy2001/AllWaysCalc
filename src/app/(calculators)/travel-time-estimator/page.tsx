
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
                <CardTitle className="font-headline text-2xl">Travel Time Estimator</CardTitle>
                <CardDescription>Estimate how long a trip will take.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Total Distance (km)</Label>
                    <Input id="distance" type="number" step="0.1" {...register('distance')} />
                    {errors.distance && <p className="text-destructive text-sm">{errors.distance.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="speed">Average Speed (km/h)</Label>
                    <Input id="speed" type="number" step="0.1" {...register('speed')} />
                    {errors.speed && <p className="text-destructive text-sm">{errors.speed.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Estimate Time</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Estimated Travel Time</CardTitle>
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
        </div>
      </main>
    </div>
  );
}
