
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
import { Home, Zap, Bolt, BatteryCharging, TrendingDown } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['voltage', 'current', 'resistance']),
  voltage: z.coerce.number().optional(),
  current: z.coerce.number().optional(),
  resistance: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

export default function OhmsLawCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'voltage',
      voltage: undefined,
      current: 2, // Amps
      resistance: 12, // Ohms
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { voltage, current, resistance } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'voltage':
                if (current !== undefined && resistance !== undefined) {
                    calculatedValue = current * resistance;
                    calculatedUnit = 'Volts (V)';
                }
                break;
            case 'current':
                 if (voltage !== undefined && resistance !== undefined) {
                    if (resistance === 0) throw new Error("Resistance cannot be zero when solving for current.");
                    calculatedValue = voltage / resistance;
                    calculatedUnit = 'Amperes (A)';
                }
                break;
            case 'resistance':
                 if (voltage !== undefined && current !== undefined) {
                    if (current === 0) throw new Error("Current cannot be zero when solving for resistance.");
                    calculatedValue = voltage / current;
                    calculatedUnit = 'Ohms (Ω)';
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
      voltage: { label: 'Voltage (V)', unit: 'Volts', description: 'The electrical potential difference between two points.' },
      current: { label: 'Current (I)', unit: 'Amps', description: 'The rate of flow of electric charge.' },
      resistance: { label: 'Resistance (R)', unit: 'Ohms', description: "The measure of opposition to current flow in a circuit." },
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
                <CardTitle className="font-headline text-2xl">Ohm's Law Calculator</CardTitle>
                <CardDescription>Solve for voltage, current, or resistance using the formula V = IR.</CardDescription>
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
                                        <SelectItem value="voltage">Voltage (V)</SelectItem>
                                        <SelectItem value="current">Current (I)</SelectItem>
                                        <SelectItem value="resistance">Resistance (R)</SelectItem>
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
                  <SharePanel resultText={`Using V=IR, the calculated ${solveFor} is ${result.value.toFixed(4)} ${result.unit}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Ohm's Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Ohm's Law states that the current through a conductor between two points is directly proportional to the voltage across the two points. It's one of the most fundamental equations in electrical engineering.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formulas Used</AccordionTrigger>
                      <AccordionContent>
                       <p>The base formula can be rearranged to solve for any variable:</p>
                       <ul className="list-disc list-inside mt-2 text-sm bg-muted p-4 rounded-md space-y-2">
                            <li>To find Voltage (V): <code className="font-mono">V = I × R</code></li>
                            <li>To find Current (I): <code className="font-mono">I = V / R</code></li>
                            <li>To find Resistance (R): <code className="font-mono">R = V / I</code></li>
                        </ul>
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                      <AccordionTrigger>FAQs</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                          <div>
                              <h4 className="font-semibold">What are the units?</h4>
                              <p>The standard SI units are Volts (V) for voltage, Amperes (A) for current, and Ohms (Ω) for resistance. This calculator uses these standard units.</p>
                          </div>
                          <div>
                              <h4 className="font-semibold">Does Ohm's Law apply to all components?</h4>
                              <p>No. Ohm's Law applies to ohmic materials and components, like resistors, where the resistance is constant regardless of the voltage or current. It does not apply to non-ohmic components like diodes or transistors.</p>
                          </div>
                           <div>
                              <h4 className="font-semibold">Disclaimer</h4>
                              <p>This calculator is for educational purposes. Electrical work can be dangerous. Always consult a qualified professional for any real-world applications.</p>
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
                <Link href="/electrical-load-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <Bolt className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Electrical Load</p>
                </Link>
                <Link href="/voltage-drop-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                   <TrendingDown className="mx-auto mb-2 size-6" />
                   <p className="font-semibold">Voltage Drop</p>
                </Link>
                <Link href="/battery-backup-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <BatteryCharging className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Battery Backup</p>
                </Link>
                <Link href="/transformer-efficiency-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <Activity className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Transformer Efficiency</p>
                </Link>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
