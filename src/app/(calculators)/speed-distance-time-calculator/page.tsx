'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Home, Gauge } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['speed', 'distance', 'time']),
  speed: z.coerce.number().optional(),
  distance: z.coerce.number().optional(),
  time: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

export default function SpeedDistanceTimeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'distance',
      speed: 60,
      time: 2,
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { speed, distance, time } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'distance':
                if (speed && time) {
                    calculatedValue = speed * time;
                    calculatedUnit = 'km';
                }
                break;
            case 'speed':
                 if (distance && time) {
                    if (time === 0) throw new Error("Time cannot be zero.");
                    calculatedValue = distance / time;
                    calculatedUnit = 'km/h';
                }
                break;
            case 'time':
                 if (distance && speed) {
                    if (speed === 0) throw new Error("Speed cannot be zero.");
                    calculatedValue = distance / speed;
                    calculatedUnit = 'hours';
                }
                break;
        }

        if (calculatedValue !== undefined) {
             setResult({ value: calculatedValue, unit: calculatedUnit });
        } else {
             setResult(null);
        }

    } catch (e: any) {
      console.error(e);
      setResult(null);
      form.setError("root", { message: e.message || "Invalid input for calculation." });
    }
  };

  const variableMap = {
      speed: { label: 'Speed', unit: 'km/h' },
      distance: { label: 'Distance', unit: 'km' },
      time: { label: 'Time', unit: 'hours' },
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
                <CardTitle className="font-headline text-2xl">Speed, Distance, Time Calculator</CardTitle>
                <CardDescription>Solve for any variable in the formula Distance = Speed × Time.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Calculate</Label>
                        <Controller
                            name="solveFor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="distance">Distance</SelectItem>
                                        <SelectItem value="speed">Speed</SelectItem>
                                        <SelectItem value="time">Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                  
                   <div className="space-y-4 p-4 border rounded-md">
                    {Object.entries(variableMap).map(([key, {label, unit}]) => {
                        if (key !== solveFor) {
                            return (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={key}>{label} ({unit})</Label>
                                    <Input 
                                        id={key}
                                        type="number"
                                        step="any"
                                        {...register(key as keyof FormValues)}
                                    />
                                </div>
                            )
                        }
                        return null;
                    })}
                   </div>
                    {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Gauge className="mx-auto size-12 text-primary" />
                     <p className="text-muted-foreground">The calculated value for {variableMap[solveFor as keyof typeof variableMap].label} is:</p>
                    <div className="text-4xl font-bold text-primary">
                        {result.value.toFixed(2).replace(/\.?0+$/, '')}
                    </div>
                     <div className="text-muted-foreground">
                        {result.unit}
                    </div>
                </CardContent>
                 <CardFooter>
                  <SharePanel resultText={`The calculated ${solveFor} is ${result.value.toFixed(2)} ${result.unit}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Speed, Distance, and Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator uses the fundamental relationship between speed, distance, and time to solve for an unknown value when the other two are known.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formulas Used</AccordionTrigger>
                      <AccordionContent>
                       <ul className="list-disc list-inside mt-2 text-sm bg-muted p-4 rounded-md space-y-2">
                            <li><code className='font-mono'>Distance = Speed × Time</code></li>
                            <li><code className='font-mono'>Speed = Distance / Time</code></li>
                            <li><code className='font-mono'>Time = Distance / Speed</code></li>
                        </ul>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
