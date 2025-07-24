
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
import { Home, Cube, TestTube, FlaskConical, Atom } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['density', 'mass', 'volume']),
  density: z.coerce.number().optional(),
  mass: z.coerce.number().optional(),
  volume: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

export default function DensityCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'density',
      mass: 1000, // kg
      volume: 1, // m^3
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { density, mass, volume } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'density':
                if (mass !== undefined && volume !== undefined) {
                    if (volume === 0) throw new Error("Volume cannot be zero.");
                    calculatedValue = mass / volume;
                    calculatedUnit = 'kg/m³';
                }
                break;
            case 'mass':
                 if (density !== undefined && volume !== undefined) {
                    calculatedValue = density * volume;
                    calculatedUnit = 'kg';
                }
                break;
            case 'volume':
                 if (density !== undefined && mass !== undefined) {
                    if (density === 0) throw new Error("Density cannot be zero.");
                    calculatedValue = mass / density;
                    calculatedUnit = 'm³';
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
      density: { label: 'Density (ρ)', unit: 'kg/m³', description: 'The mass of a substance per unit volume.' },
      mass: { label: 'Mass (m)', unit: 'kg', description: 'The amount of matter in the object.' },
      volume: { label: 'Volume (V)', unit: 'm³', description: 'The amount of space the object occupies.' },
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
                <CardTitle className="font-headline text-2xl">Density Calculator</CardTitle>
                <CardDescription>Solve for density, mass, or volume using the formula ρ = m/V.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Calculate</Label>
                        <p className="text-xs text-muted-foreground">Select the variable you want to solve for.</p>
                        <Controller
                            name="solveFor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="density">Density (ρ)</SelectItem>
                                        <SelectItem value="mass">Mass (m)</SelectItem>
                                        <SelectItem value="volume">Volume (V)</SelectItem>
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
                    <Cube className="mx-auto size-12 text-primary" />
                     <p className="text-muted-foreground">The calculated value for {variableMap[solveFor as keyof typeof variableMap].label.split(' ')[0]} is:</p>
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
              <CardTitle className="font-headline">Understanding Density</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Density is a fundamental property of matter that measures the mass per unit volume. It's an intensive property, which means it doesn't change with the size of the sample. For example, a small gold nugget and a large gold bar have the same density.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formula Used</AccordionTrigger>
                      <AccordionContent>
                       <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                            ρ = m / V
                        </code>
                        </pre>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                            <li><b>ρ (rho)</b> = Density (SI unit: kg/m³)</li>
                            <li><b>m</b> = Mass (SI unit: kg)</li>
                            <li><b>V</b> = Volume (SI unit: m³)</li>
                        </ul>
                      </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-2">
                    <AccordionTrigger>FAQs</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Why is density useful?</h4>
                            <p>Density is a key concept in buoyancy, purity identification, and material science. It helps us understand why ships float, identify substances by comparing their densities, and design materials with specific properties.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Does temperature affect density?</h4>
                            <p>Yes. For most substances, as temperature increases, the volume increases while the mass stays the same, leading to a decrease in density. Water is a famous exception, being most dense at 4°C.</p>
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
              <Link href="/ideal-gas-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <FlaskConical className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Ideal Gas Law</p>
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
