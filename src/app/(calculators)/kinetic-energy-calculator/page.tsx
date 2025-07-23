
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
import { Home, Flame } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['energy', 'mass', 'velocity']),
  energy: z.coerce.number().optional(),
  mass: z.coerce.number().optional(),
  velocity: z.coerce.number().optional(),
}).refine(data => {
    if(data.solveFor === 'mass' || data.solveFor === 'velocity') {
        if(data.energy === undefined) return false;
    }
    if(data.solveFor === 'energy' || data.solveFor === 'velocity') {
        if(data.mass === undefined) return false;
    }
    if(data.solveFor === 'energy' || data.solveFor === 'mass') {
        if(data.velocity === undefined) return false;
    }
    return true;
}, {
    message: "Please fill in the required fields for the calculation.",
    path: ["solveFor"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

export default function KineticEnergyCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'energy',
      mass: 10,
      velocity: 5,
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { energy, mass, velocity } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'energy':
                if (mass !== undefined && velocity !== undefined) {
                    calculatedValue = 0.5 * mass * Math.pow(velocity, 2);
                    calculatedUnit = 'Joules (J)';
                }
                break;
            case 'mass':
                 if (energy !== undefined && velocity !== undefined) {
                    if (velocity === 0) throw new Error("Velocity cannot be zero when solving for mass.");
                    calculatedValue = (2 * energy) / Math.pow(velocity, 2);
                    calculatedUnit = 'Kilograms (kg)';
                }
                break;
            case 'velocity':
                 if (energy !== undefined && mass !== undefined) {
                    if (mass === 0) throw new Error("Mass cannot be zero when solving for velocity.");
                    const vSquared = (2 * energy) / mass;
                    if (vSquared < 0) throw new Error("Cannot calculate velocity from negative energy.");
                    calculatedValue = Math.sqrt(vSquared);
                    calculatedUnit = 'm/s';
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
      energy: { label: 'Kinetic Energy (KE)', unit: 'Joules' },
      mass: { label: 'Mass (m)', unit: 'kg' },
      velocity: { label: 'Velocity (v)', unit: 'm/s' },
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
                <CardTitle className="font-headline text-2xl">Kinetic Energy Calculator</CardTitle>
                <CardDescription>Solve for any variable in KE = ½mv².</CardDescription>
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
                                        <SelectItem value="energy">Kinetic Energy (KE)</SelectItem>
                                        <SelectItem value="mass">Mass (m)</SelectItem>
                                        <SelectItem value="velocity">Velocity (v)</SelectItem>
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
                     {errors.solveFor && <p className="text-destructive text-sm">{errors.solveFor.message}</p>}
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
                    <Flame className="mx-auto size-12 text-primary" />
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
              <CardTitle className="font-headline">Understanding Kinetic Energy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Kinetic energy is the energy that an object possesses due to its motion. It is defined as the work needed to accelerate a body of a given mass from rest to its stated velocity.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formula Used</AccordionTrigger>
                      <AccordionContent>
                       <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                            KE = ½ × m × v²
                        </code>
                        </pre>
                        <ul className="list-disc list-inside mt-2 text-sm">
                            <li><b>KE</b> = Kinetic Energy (Joules)</li>
                            <li><b>m</b> = Mass (kg)</li>
                            <li><b>v</b> = Velocity (m/s)</li>
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
