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
import { Home, FlaskConical, TestTube, Atom } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['pressure', 'volume', 'moles', 'temperature']),
  pressure: z.coerce.number().optional(),
  volume: z.coerce.number().optional(),
  moles: z.coerce.number().optional(),
  temperature: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

const R = 8.314; // Ideal gas constant in J/(mol·K) which is Pa·m³/(mol·K)

export default function IdealGasLawCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'pressure',
      pressure: undefined,
      volume: 22.4 / 1000, // m^3
      moles: 1,
      temperature: 273.15, // Kelvin
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { pressure, volume, moles, temperature } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'pressure':
                if (volume !== undefined && moles !== undefined && temperature !== undefined) {
                    if (volume === 0) throw new Error("Volume cannot be zero.");
                    calculatedValue = (moles * R * temperature) / volume;
                    calculatedUnit = 'Pascals (Pa)';
                }
                break;
            case 'volume':
                 if (pressure !== undefined && moles !== undefined && temperature !== undefined) {
                    if (pressure === 0) throw new Error("Pressure cannot be zero.");
                    calculatedValue = (moles * R * temperature) / pressure;
                    calculatedUnit = 'Cubic Meters (m³)';
                }
                break;
            case 'moles':
                 if (pressure !== undefined && volume !== undefined && temperature !== undefined) {
                    if (temperature === 0) throw new Error("Temperature cannot be zero.");
                    calculatedValue = (pressure * volume) / (R * temperature);
                    calculatedUnit = 'Moles (mol)';
                }
                break;
            case 'temperature':
                 if (pressure !== undefined && volume !== undefined && moles !== undefined) {
                    if (moles === 0) throw new Error("Moles cannot be zero.");
                    calculatedValue = (pressure * volume) / (R * moles);
                    calculatedUnit = 'Kelvin (K)';
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
      pressure: { label: 'Pressure (P)', unit: 'Pascals', description: 'The force exerted by the gas per unit area.' },
      volume: { label: 'Volume (V)', unit: 'm³', description: 'The space occupied by the gas.' },
      moles: { label: 'Amount (n)', unit: 'moles', description: 'The amount of gas substance.' },
      temperature: { label: 'Temperature (T)', unit: 'Kelvin', description: 'The average kinetic energy of the gas particles.' },
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
                <CardTitle className="font-headline text-2xl">Ideal Gas Law Calculator</CardTitle>
                <CardDescription>Solve for any variable in the equation PV = nRT.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Solve for</Label>
                        <p className="text-xs text-muted-foreground">Select the variable you want to find.</p>
                        <Controller
                            name="solveFor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pressure">Pressure (P)</SelectItem>
                                        <SelectItem value="volume">Volume (V)</SelectItem>
                                        <SelectItem value="moles">Amount (n)</SelectItem>
                                        <SelectItem value="temperature">Temperature (T)</SelectItem>
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
                                        placeholder={`Enter value in ${unit}`}
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
                    <FlaskConical className="mx-auto size-12 text-primary" />
                     <p className="text-muted-foreground">The calculated value is:</p>
                    <div className="text-4xl font-bold text-primary">
                        {result.value.toExponential(4).replace(/\.?0+e\+0$/, '')}
                    </div>
                     <div className="text-muted-foreground">
                        {result.unit}
                    </div>
                </CardContent>
                 <CardFooter>
                  <SharePanel resultText={`The calculated ${solveFor} is ${result.value.toExponential(4)} ${result.unit}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding the Ideal Gas Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The ideal gas law is the equation of state of a hypothetical ideal gas. It is a good approximation of the behavior of many gases under many conditions, though it has several limitations. It combines Boyle's Law, Charles's Law, Gay-Lussac's Law, and Avogadro's Law.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formula Used</AccordionTrigger>
                      <AccordionContent>
                       <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                            PV = nRT
                        </code>
                        </pre>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                            <li><b>P</b> = Pressure (in Pascals, Pa)</li>
                            <li><b>V</b> = Volume (in cubic meters, m³)</li>
                            <li><b>n</b> = Amount of substance (in moles, mol)</li>
                            <li><b>R</b> = Ideal gas constant (8.314 J/mol·K)</li>
                            <li><b>T</b> = Absolute temperature (in Kelvin, K)</li>
                        </ul>
                        <p className="mt-2 text-xs text-destructive">Note: All inputs must be in SI units for this calculator (Pascals, m³, moles, Kelvin).</p>
                      </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-2">
                    <AccordionTrigger>FAQs</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">What is an "ideal gas"?</h4>
                            <p>An ideal gas is a theoretical gas composed of many randomly moving point particles that are not subject to interparticle interactions. It's a simplified model that works well for many real gases at high temperatures and low pressures.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">When does the Ideal Gas Law not work?</h4>
                            <p>The law becomes less accurate at very low temperatures or very high pressures, where the volume of the gas particles and the forces between them become significant. In these cases, more complex equations of state like the Van der Waals equation are used.</p>
                        </div>
                         <div>
                            <h4 className="font-semibold">How do I convert Celsius to Kelvin?</h4>
                            <p>To convert from Celsius (°C) to Kelvin (K), you add 273.15. For example, 25°C is equal to 298.15 K.</p>
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
              <Link href="/molar-mass-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <TestTube className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Molar Mass</p>
              </Link>
              <Link href="/density-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <Home className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Density Calculator</p>
              </Link>
              <Link href="/newtons-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <Atom className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Newton's Second Law</p>
              </Link>
              <Link href="/ph-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <TestTube className="mx-auto mb-2 size-6" />
                <p className="font-semibold">pH Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
