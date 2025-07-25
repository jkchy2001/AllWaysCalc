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
import { Home, Beaker, TestTube, FlaskConical, Atom } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  calcType: z.enum(['ph_from_h', 'poh_from_oh', 'h_from_ph', 'oh_from_poh']),
  concentration: z.coerce.number().positive("Concentration must be positive.").optional(),
  ph: z.coerce.number().min(0).max(14).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  resultValue: number;
  resultType: 'pH' | 'pOH' | '[H+]' | '[OH-]';
  acidity: 'Acidic' | 'Basic' | 'Neutral';
  complementaryValue: number;
  complementaryType: 'pOH' | 'pH';
};

export default function PhCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calcType: 'ph_from_h',
      concentration: 1e-7,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const calcType = watch('calcType');

  const onSubmit = (data: FormValues) => {
    let resultValue: number = 0;
    let resultType: CalculationResult['resultType'] = 'pH';
    let acidity: CalculationResult['acidity'] = 'Neutral';
    let complementaryValue: number = 0;
    let complementaryType: CalculationResult['complementaryType'] = 'pOH';
    let calculatedPh = 7;

    switch (data.calcType) {
      case 'ph_from_h':
        if (!data.concentration) return;
        calculatedPh = -Math.log10(data.concentration);
        resultValue = calculatedPh;
        resultType = 'pH';
        complementaryValue = 14 - calculatedPh;
        complementaryType = 'pOH';
        break;
      case 'poh_from_oh':
        if (!data.concentration) return;
        const poh = -Math.log10(data.concentration);
        resultValue = poh;
        resultType = 'pOH';
        calculatedPh = 14 - poh;
        complementaryValue = calculatedPh;
        complementaryType = 'pH';
        break;
      case 'h_from_ph':
        if (data.ph === undefined) return;
        resultValue = Math.pow(10, -data.ph);
        resultType = '[H+]';
        calculatedPh = data.ph;
        complementaryValue = 14 - data.ph;
        complementaryType = 'pOH';
        break;
      case 'oh_from_poh':
        if (data.ph === undefined) return; // Using ph input for pOH value
        resultValue = Math.pow(10, -data.ph);
        resultType = '[OH-]';
        calculatedPh = 14 - data.ph;
        complementaryValue = calculatedPh;
        complementaryType = 'pH';
        break;
    }
    
    if (calculatedPh < 7) acidity = 'Acidic';
    else if (calculatedPh > 7) acidity = 'Basic';
    else acidity = 'Neutral';

    setResult({ resultValue, resultType, acidity, complementaryValue, complementaryType });
  };

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
                            <CardTitle className="font-headline text-2xl">pH Calculator</CardTitle>
                            <CardDescription>Calculate pH, pOH, and ion concentrations for aqueous solutions.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    defaultValue="ph_from_h"
                                    className="grid grid-cols-2 gap-4"
                                    value={calcType}
                                    onValueChange={(value) => form.setValue('calcType', value as FormValues['calcType'])}
                                >
                                    <Label htmlFor="ph_from_h" className={`flex items-center justify-center text-center rounded-md border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${calcType === 'ph_from_h' ? 'border-primary': 'border-muted'}`}>
                                      <RadioGroupItem value="ph_from_h" id="ph_from_h" className="peer sr-only" />
                                      <span>pH from [H⁺]</span>
                                    </Label>
                                    <Label htmlFor="poh_from_oh" className={`flex items-center justify-center text-center rounded-md border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${calcType === 'poh_from_oh' ? 'border-primary': 'border-muted'}`}>
                                      <RadioGroupItem value="poh_from_oh" id="poh_from_oh" className="peer sr-only" />
                                      <span>pOH from [OH⁻]</span>
                                    </Label>
                                     <Label htmlFor="h_from_ph" className={`flex items-center justify-center text-center rounded-md border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${calcType === 'h_from_ph' ? 'border-primary': 'border-muted'}`}>
                                      <RadioGroupItem value="h_from_ph" id="h_from_ph" className="peer sr-only" />
                                      <span>[H⁺] from pH</span>
                                    </Label>
                                     <Label htmlFor="oh_from_poh" className={`flex items-center justify-center text-center rounded-md border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${calcType === 'oh_from_poh' ? 'border-primary': 'border-muted'}`}>
                                      <RadioGroupItem value="oh_from_poh" id="oh_from_poh" className="peer sr-only" />
                                      <span>[OH⁻] from pOH</span>
                                    </Label>
                                </RadioGroup>

                                {(calcType === 'ph_from_h' || calcType === 'poh_from_oh') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="concentration">Concentration (mol/L)</Label>
                                        <p className="text-xs text-muted-foreground">The molar concentration of H⁺ or OH⁻ ions. Use 'e' notation for scientific values, e.g., `1.0e-7`.</p>
                                        <Input id="concentration" type="text" placeholder="e.g., 1.0e-7" {...register('concentration')} />
                                        {errors.concentration && <p className="text-destructive text-sm">{errors.concentration.message}</p>}
                                    </div>
                                )}
                                {(calcType === 'h_from_ph' || calcType === 'oh_from_poh') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="ph">{calcType === 'h_from_ph' ? 'pH Value' : 'pOH Value'}</Label>
                                        <p className="text-xs text-muted-foreground">The pH or pOH value, typically between 0 and 14.</p>
                                        <Input id="ph" type="number" step="any" placeholder="e.g., 7" {...register('ph')} />
                                        {errors.ph && <p className="text-destructive text-sm">{errors.ph.message}</p>}
                                    </div>
                                )}
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
                                <Beaker className="mx-auto size-12 text-primary" />
                                <div className={`text-3xl font-bold ${result.acidity === 'Acidic' ? 'text-red-500' : result.acidity === 'Basic' ? 'text-blue-500' : 'text-green-500'}`}>
                                    {result.acidity}
                                </div>
                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                     <div className="p-2 rounded-lg bg-background">
                                        <p className="text-sm text-muted-foreground">{result.resultType}</p>
                                        <p className="text-2xl font-bold text-primary">{result.resultType.includes('[') ? result.resultValue.toExponential(2) : result.resultValue.toFixed(2)}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-background">
                                        <p className="text-sm text-muted-foreground">{result.complementaryType}</p>
                                        <p className="text-2xl font-bold text-primary">{result.complementaryValue.toFixed(2)}</p>
                                    </div>
                                 </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`The calculated ${result.resultType} is ${result.resultValue.toFixed(2)}.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding pH</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        pH is a scale used to specify the acidity or basicity of an aqueous solution. Acidic solutions have a lower pH, while basic solutions have a higher pH. At room temperature, pure water is neutral, being neither an acid nor a base, with a pH of 7.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Key Formulas</AccordionTrigger>
                              <AccordionContent>
                               <p>This calculator is based on the following fundamental relationships in chemistry:</p>
                               <ul className="list-disc list-inside mt-2 space-y-1 bg-muted p-4 rounded-md">
                                 <li><b>pH:</b> The negative base-10 logarithm of the hydrogen ion concentration. `pH = -log₁₀[H⁺]`</li>
                                 <li><b>pOH:</b> The negative base-10 logarithm of the hydroxide ion concentration. `pOH = -log₁₀[OH⁻]`</li>
                                 <li><b>Relationship:</b> At 25°C, the sum of pH and pOH is always 14. `pH + pOH = 14`</li>
                                 <li><b>Ion Concentration:</b> The concentration can be found from pH or pOH. `[H⁺] = 10⁻ᵖᴴ` and `[OH⁻] = 10⁻ᵖᴼᴴ`</li>
                               </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>FAQs</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">What does a pH of 7 mean?</h4>
                                    <p>A pH of 7 is considered neutral. It means the concentration of hydrogen ions [H⁺] is equal to the concentration of hydroxide ions [OH⁻]. Pure water is a perfect example.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Is it possible to have a pH below 0 or above 14?</h4>
                                    <p>Yes. While the typical 0-14 scale covers most common solutions, highly concentrated strong acids can have a negative pH, and highly concentrated strong bases can have a pH greater than 14.</p>
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
                         <Link href="/density-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <Home className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Density Calculator</p>
                        </Link>
                        <Link href="/newtons-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <Atom className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Newton's Second Law</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
