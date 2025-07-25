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
import { Home, Zap, Atom, TrendingUp, Flame, RotateCw } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['force', 'mass', 'acceleration']),
  force: z.coerce.number().optional(),
  mass: z.coerce.number().optional(),
  acceleration: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

export default function NewtonsLawCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'force',
      force: undefined,
      mass: 10, // kg
      acceleration: 9.8, // m/s^2
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { force, mass, acceleration } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'force':
                if (mass !== undefined && acceleration !== undefined) {
                    calculatedValue = mass * acceleration;
                    calculatedUnit = 'Newtons (N)';
                }
                break;
            case 'mass':
                 if (force !== undefined && acceleration !== undefined) {
                    if (acceleration === 0) throw new Error("Acceleration cannot be zero when solving for mass.");
                    calculatedValue = force / acceleration;
                    calculatedUnit = 'Kilograms (kg)';
                }
                break;
            case 'acceleration':
                 if (force !== undefined && mass !== undefined) {
                    if (mass === 0) throw new Error("Mass cannot be zero when solving for acceleration.");
                    calculatedValue = force / mass;
                    calculatedUnit = 'm/s²';
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
      force: { label: 'Force (F)', unit: 'Newtons', description: 'The push or pull on an object.' },
      mass: { label: 'Mass (m)', unit: 'kg', description: 'The amount of matter in an object.' },
      acceleration: { label: 'Acceleration (a)', unit: 'm/s²', description: 'The rate of change of velocity.' },
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
                <CardTitle className="font-headline text-2xl">Newton's Second Law Calculator</CardTitle>
                <CardDescription>Solve for force, mass, or acceleration using the equation F = ma.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Solve for</Label>
                        <Controller
                            name="solveFor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="force">Force (F)</SelectItem>
                                        <SelectItem value="mass">Mass (m)</SelectItem>
                                        <SelectItem value="acceleration">Acceleration (a)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                  
                   <div className="space-y-4 p-4 border rounded-md">
                    {Object.entries(variableMap).map(([key, {label, unit, description}]) => {
                        if (key !== solveFor) {
                            return (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={key}>{label}</Label>
                                    <p className="text-xs text-muted-foreground">{description}</p>
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
                    <Zap className="mx-auto size-12 text-primary" />
                     <p className="text-muted-foreground">The calculated value for {variableMap[solveFor as keyof typeof variableMap].label.split(' ')[0]} is:</p>
                    <div className="text-4xl font-bold text-primary">
                        {result.value.toFixed(4).replace(/\.?0+$/, '')}
                    </div>
                     <div className="text-muted-foreground">
                        {result.unit}
                    </div>
                </CardContent>
                 <CardFooter>
                  <SharePanel resultText={`Using F=ma, the calculated ${solveFor} is ${result.value.toFixed(4)} ${result.unit}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Newton's Second Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Newton's Second Law of Motion is a fundamental principle in classical mechanics that describes the relationship between an object's mass, the force applied to it, and the resulting acceleration.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formula Explained</AccordionTrigger>
                      <AccordionContent>
                       <p>The law is mathematically stated as:</p>
                       <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                            F = m × a
                        </code>
                        </pre>
                        <ul className="list-disc list-inside mt-2 text-sm">
                            <li><b>F (Force):</b> The net force acting on the object, measured in Newtons (N).</li>
                            <li><b>m (Mass):</b> A measure of the object's inertia, measured in kilograms (kg).</li>
                            <li><b>a (Acceleration):</b> The rate at which the object's velocity changes, measured in meters per second squared (m/s²).</li>
                        </ul>
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>FAQs</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">What is a Newton (N)?</h4>
                            <p>One Newton is defined as the amount of force required to accelerate a 1 kilogram mass at a rate of 1 meter per second squared. So, 1 N = 1 kg·m/s².</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Why can't acceleration be zero when solving for mass?</h4>
                            <p>If acceleration is zero, the net force on the object is also zero (unless the mass is infinite, which is not physically possible). The formula becomes `Mass = Force / 0`, which is an undefined mathematical operation. An object with zero acceleration is either at rest or moving at a constant velocity.</p>
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
                <Link href="/acceleration-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <TrendingUp className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Acceleration</p>
                </Link>
                <Link href="/kinetic-energy-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                   <Flame className="mx-auto mb-2 size-6" />
                   <p className="font-semibold">Kinetic Energy</p>
                </Link>
                <Link href="/torque-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <RotateCw className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Torque</p>
                </Link>
                <Link href="/ohms-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <Zap className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Ohm's Law</p>
                </Link>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
