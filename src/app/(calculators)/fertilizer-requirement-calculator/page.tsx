
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Home, Trash2, TestTube } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const fertilizerSchema = z.object({
  name: z.string().optional(),
  n: z.coerce.number().min(0).max(100).default(0),
  p: z.coerce.number().min(0).max(100).default(0),
  k: z.coerce.number().min(0).max(100).default(0),
});

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  area: z.coerce.number().min(0.01, 'Area must be positive.'),
  recN: z.coerce.number().min(0),
  recP: z.coerce.number().min(0),
  recK: z.coerce.number().min(0),
  fertilizers: z.array(fertilizerSchema).min(1, 'At least one fertilizer is required.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  fertilizers: { name: string; amount: number }[];
  unit: 'kg' | 'lbs';
};

export default function FertilizerCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      area: 1, // 1 hectare
      recN: 120, // kg/ha
      recP: 60, // kg/ha
      recK: 40, // kg/ha
      fertilizers: [
        { name: 'Urea', n: 46, p: 0, k: 0 },
        { name: 'DAP', n: 18, p: 46, k: 0 },
        { name: 'MOP', n: 0, p: 0, k: 60 },
      ],
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fertilizers',
  });

  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { area, recN, recP, recK, fertilizers, unit } = data;

    // Convert recommendations to per-unit-of-area basis
    if (unit === 'metric') { // rec is in kg/ha, area is in ha
      recN *= area;
      recP *= area;
      recK *= area;
    } else { // rec is in lbs/acre, area is in acres
       recN *= area;
       recP *= area;
       recK *= area;
    }
    
    // A simplified solver logic, this is a complex problem (linear algebra)
    // This assumes a priority: P, then K, then N, adjusting requirements as it goes.
    // It's a common heuristic but not perfect for all combos.
    
    let requiredN = recN;
    let requiredP = recP;
    let requiredK = recK;
    
    const results: {name: string, amount: number}[] = [];

    const pFert = fertilizers.find(f => f.p > 0 && f.n === 0 && f.k === 0) || fertilizers.find(f => f.p > 0 && f.n === 0) || fertilizers.find(f => f.p > 0);
    if(pFert && pFert.p > 0 && requiredP > 0) {
        const amount = requiredP / (pFert.p / 100);
        results.push({ name: pFert.name || 'Phosphorus Fertilizer', amount });
        requiredP = 0;
        requiredN -= amount * (pFert.n / 100);
        requiredK -= amount * (pFert.k / 100);
    }
    
    const kFert = fertilizers.find(f => f.k > 0 && f.n === 0 && f.p === 0) || fertilizers.find(f => f.k > 0 && f.n === 0) || fertilizers.find(f => f.k > 0);
    if(kFert && kFert.k > 0 && requiredK > 0) {
        const amount = requiredK / (kFert.k / 100);
        results.push({ name: kFert.name || 'Potassium Fertilizer', amount });
        requiredK = 0;
        requiredN -= amount * (kFert.n / 100);
        // Assuming P is already handled
    }
    
    const nFert = fertilizers.find(f => f.n > 0 && f.p === 0 && f.k === 0) || fertilizers.find(f => f.n > 0);
     if(nFert && nFert.n > 0 && requiredN > 0) {
        const amount = requiredN / (nFert.n / 100);
        results.push({ name: nFert.name || 'Nitrogen Fertilizer', amount });
        requiredN = 0;
    }

    setResult({ fertilizers: results, unit: unit === 'metric' ? 'kg' : 'lbs' });
  };
  
  const unitLabel = unit === 'metric' ? {area: 'hectares', rec: 'kg/ha', mass: 'kg'} : {area: 'acres', rec: 'lbs/acre', mass: 'lbs'};

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
                <CardTitle className="font-headline text-2xl">Fertilizer Requirement Calculator</CardTitle>
                <CardDescription>Calculate the amount of fertilizer needed for your crops.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-md space-y-4">
                      <h3 className="font-semibold text-sm">Area & Recommendation</h3>
                       <RadioGroup
                        defaultValue="metric"
                        className="grid grid-cols-2 gap-4"
                        value={unit}
                        onValueChange={(value) => form.setValue('unit', value as 'metric' | 'imperial')}
                        >
                        <div>
                            <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial</Label>
                        </div>
                      </RadioGroup>
                       <div className="space-y-2">
                          <Label htmlFor="area">Total Area ({unitLabel.area})</Label>
                          <Input id="area" type="number" step="0.1" {...register('area')} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="recN">N ({unitLabel.rec})</Label>
                            <Input id="recN" type="number" {...register('recN')} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recP">P ({unitLabel.rec})</Label>
                            <Input id="recP" type="number" {...register('recP')} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recK">K ({unitLabel.rec})</Label>
                            <Input id="recK" type="number" {...register('recK')} />
                          </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md space-y-4">
                      <h3 className="font-semibold text-sm">Fertilizer Composition (%)</h3>
                       {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_50px_50px_50px_auto] items-center gap-1">
                          <Input placeholder="Fertilizer Name" {...register(`fertilizers.${index}.name`)} />
                          <Input className="text-center" placeholder="N" {...register(`fertilizers.${index}.n`)} />
                          <Input className="text-center" placeholder="P" {...register(`fertilizers.${index}.p`)} />
                          <Input className="text-center" placeholder="K" {...register(`fertilizers.${index}.k`)} />
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                       ))}
                       <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', n: 0, p: 0, k: 0 })}>Add Fertilizer</Button>
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
                  <CardTitle className="font-headline">Fertilizer Required</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {result.fertilizers.map((fert, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{fert.name}</TableCell>
                                    <TableCell className="text-right text-lg font-bold text-primary">{fert.amount.toFixed(2)} {result.unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <p className="text-xs text-muted-foreground mt-4">Note: This is a simplified calculation. For complex fertilizer mixes, consult an agronomist.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My fertilizer plan requires ${result.fertilizers.map(f => `${f.amount.toFixed(2)} ${result.unit} of ${f.name}`).join(', ')}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Calculate Fertilizer Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you determine the amount of different fertilizers to apply based on soil test recommendations (N, P, K) and the nutrient content of the fertilizers themselves.
              </p>
               <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate total nutrient needs by multiplying the recommended rate (e.g., kg/ha) by the total area (ha).</li>
                    <li>For each nutrient, divide the total amount needed by the percentage of that nutrient in the chosen fertilizer to find the total amount of that fertilizer product to apply.</li>
                    <li>If a fertilizer contains multiple nutrients (like DAP), applying it to meet one nutrient's requirement will also supply other nutrients. This calculator uses a simplified approach to account for this, but a soil expert can provide a more precise plan for complex mixes.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
