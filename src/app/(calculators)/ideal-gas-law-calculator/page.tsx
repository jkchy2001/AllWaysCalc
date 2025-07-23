
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
import { Home, FlaskConical } from 'lucide-react';
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
                if (volume && moles && temperature) {
                    calculatedValue = (moles * R * temperature) / volume;
                    calculatedUnit = 'Pascals (Pa)';
                }
                break;
            case 'volume':
                 if (pressure && moles && temperature) {
                    calculatedValue = (moles * R * temperature) / pressure;
                    calculatedUnit = 'Cubic Meters (m³)';
                }
                break;
            case 'moles':
                 if (pressure && volume && temperature) {
                    calculatedValue = (pressure * volume) / (R * temperature);
                    calculatedUnit = 'Moles (mol)';
                }
                break;
            case 'temperature':
                 if (pressure && volume && moles) {
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

    } catch (e) {
      console.error(e);
      setResult(null);
    }
  };

  const variableMap = {
      pressure: { label: 'Pressure (P)', unit: 'Pascals' },
      volume: { label: 'Volume (V)', unit: 'm³' },
      moles: { label: 'Amount (n)', unit: 'moles' },
      temperature: { label: 'Temperature (T)', unit: 'Kelvin' },
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
                        {result.value.toExponential(4)}
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
                The ideal gas law is the equation of state of a hypothetical ideal gas. It is a good approximation of the behavior of many gases under many conditions, though it has several limitations.
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
                        <ul className="list-disc list-inside mt-2 text-sm">
                            <li><b>P</b> = Pressure (Pascals)</li>
                            <li><b>V</b> = Volume (m³)</li>
                            <li><b>n</b> = Amount of substance (moles)</li>
                            <li><b>R</b> = Ideal gas constant (8.314 J/mol·K)</li>
                            <li><b>T</b> = Temperature (Kelvin)</li>
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

