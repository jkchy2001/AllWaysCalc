
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
import { Home, TrendingUp, Info } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['acceleration', 'final_velocity', 'initial_velocity', 'time']),
  acceleration: z.coerce.number().optional(),
  final_velocity: z.coerce.number().optional(),
  initial_velocity: z.coerce.number().optional(),
  time: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

export default function AccelerationCalculatorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'acceleration',
      initial_velocity: 0,
      final_velocity: 20,
      time: 10,
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { acceleration, final_velocity, initial_velocity, time } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'acceleration':
                if (final_velocity !== undefined && initial_velocity !== undefined && time !== undefined) {
                    if (time === 0) throw new Error("Time cannot be zero.");
                    calculatedValue = (final_velocity - initial_velocity) / time;
                    calculatedUnit = 'm/s²';
                }
                break;
            case 'final_velocity':
                 if (initial_velocity !== undefined && acceleration !== undefined && time !== undefined) {
                    calculatedValue = initial_velocity + (acceleration * time);
                    calculatedUnit = 'm/s';
                }
                break;
            case 'initial_velocity':
                 if (final_velocity !== undefined && acceleration !== undefined && time !== undefined) {
                    calculatedValue = final_velocity - (acceleration * time);
                    calculatedUnit = 'm/s';
                }
                break;
            case 'time':
                 if (final_velocity !== undefined && initial_velocity !== undefined && acceleration !== undefined) {
                    if (acceleration === 0) throw new Error("Acceleration cannot be zero for this calculation.");
                    calculatedValue = (final_velocity - initial_velocity) / acceleration;
                    calculatedUnit = 's';
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
      acceleration: { label: 'Acceleration (a)', unit: 'm/s²' },
      final_velocity: { label: 'Final Velocity (v)', unit: 'm/s' },
      initial_velocity: { label: 'Initial Velocity (u)', unit: 'm/s' },
      time: { label: 'Time (t)', unit: 's' },
  }

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
                <CardTitle className="font-headline text-2xl">Acceleration Calculator</CardTitle>
                <CardDescription>Solve for any variable in the uniform acceleration equation (a = Δv / t).</CardDescription>
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
                                        <SelectItem value="acceleration">Acceleration</SelectItem>
                                        <SelectItem value="final_velocity">Final Velocity</SelectItem>
                                        <SelectItem value="initial_velocity">Initial Velocity</SelectItem>
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
                                    <Label htmlFor={key}>{label}</Label>
                                    <Input 
                                        id={key}
                                        type="number"
                                        step="any"
                                        placeholder={unit}
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
                  <Button type="submit" className="w-full">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <TrendingUp className="mx-auto size-12 text-primary" />
                     <p className="text-muted-foreground">The calculated value for {variableMap[solveFor as keyof typeof variableMap].label.split(' ')[0]} is:</p>
                    <div className="text-4xl font-bold text-primary">
                        {result.value.toFixed(4).replace(/\.?0+$/, '')}
                    </div>
                     <div className="text-muted-foreground">
                        {result.unit}
                    </div>
                </CardContent>
                 <CardFooter>
                  <SharePanel resultText={`The calculated ${solveFor} is ${result.value.toFixed(4)} ${result.unit}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Info className="size-5" /> Understanding Acceleration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Acceleration is a vector quantity defined as the rate at which an object changes its velocity. An object is accelerating if it is changing its velocity. This calculator deals with uniform acceleration, where the velocity changes at a constant rate.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formula Used</AccordionTrigger>
                      <AccordionContent>
                       <p>The calculator uses the fundamental formula for uniform acceleration:</p>
                       <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                            a = (v - u) / t
                        </code>
                        </pre>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                            <li><b>a</b> = Acceleration (in meters per second squared, m/s²)</li>
                            <li><b>v</b> = Final Velocity (in meters per second, m/s)</li>
                            <li><b>u</b> = Initial Velocity (in meters per second, m/s)</li>
                            <li><b>t</b> = Time elapsed (in seconds, s)</li>
                        </ul>
                        <p className='mt-2'>This formula can be algebraically rearranged to solve for any of the other variables.</p>
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>FAQs</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">What is negative acceleration?</h4>
                            <p>Negative acceleration, also known as deceleration or retardation, occurs when an object slows down. In the formula, this would mean the final velocity (v) is less than the initial velocity (u).</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">What if acceleration is zero?</h4>
                            <p>If acceleration is zero, the object's velocity is constant. It is not speeding up or slowing down. Our calculator will show an error if you try to solve for time when acceleration is zero, as the time taken would be infinite unless the initial and final velocities are the same.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">What are the units used?</h4>
                            <p>This calculator uses standard SI units for consistency: meters per second (m/s) for velocity, seconds (s) for time, and meters per second squared (m/s²) for acceleration.</p>
                        </div>
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
              <Link href="/newtons-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Newton's Second Law</p>
              </Link>
              <Link href="/kinetic-energy-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Kinetic Energy</p>
              </Link>
              <Link href="/speed-distance-time-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Speed, Distance, Time</p>
              </Link>
              <Link href="/torque-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Torque</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
