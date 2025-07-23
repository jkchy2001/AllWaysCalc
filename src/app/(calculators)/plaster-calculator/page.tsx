
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
import { Home, Layers } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  wallLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  wallHeight: z.coerce.number().min(0.1, 'Height must be positive.'),
  thickness: z.coerce.number().min(1, 'Thickness must be positive.'),
  ratio: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  cementBags: number;
  sandVolume: number;
  totalVolume: number;
};

const cementSandRatios = {
    "1:4": { cement: 1, sand: 4 },
    "1:5": { cement: 1, sand: 5 },
    "1:6": { cement: 1, sand: 6 },
};

export default function PlasterCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      wallLength: 10,
      wallHeight: 3,
      thickness: 12,
      ratio: "1:6",
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { wallLength, wallHeight, thickness, ratio, unit } = data;
    
    // Convert all to a base unit (m or ft)
    if (unit === 'metric') {
        thickness /= 1000; // mm to m
    } else { // imperial
        thickness /= 12;   // in to ft
    }

    const wetVolume = wallLength * wallHeight * thickness;
    
    // Add 35% for dry volume (for voids and shrinkage) and 20% for wastage
    const dryVolume = wetVolume * 1.35 * 1.20;

    const ratioParts = cementSandRatios[ratio as keyof typeof cementSandRatios];
    const totalRatioParts = ratioParts.cement + ratioParts.sand;

    const cementVolume = (dryVolume * ratioParts.cement) / totalRatioParts;
    const sandVolume = (dryVolume * ratioParts.sand) / totalRatioParts;

    // 1 bag of cement is approx 0.0347 m^3 or 1.226 cubic feet
    const cementBagVolume = unit === 'metric' ? 0.0347 : 1.226;
    const cementBags = Math.ceil(cementVolume / cementBagVolume);
    
    setResult({
      cementBags,
      sandVolume,
      totalVolume: dryVolume,
    });
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
                <CardTitle className="font-headline text-2xl">Plaster Calculator</CardTitle>
                <CardDescription>Estimate cement and sand needed for plastering.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <RadioGroup
                        defaultValue="metric"
                        className="grid grid-cols-2 gap-4"
                        value={unit}
                        onValueChange={(value) => form.setValue('unit', value as 'metric' | 'imperial')}
                    >
                        <div>
                            <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (m/mm)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (ft/in)</Label>
                        </div>
                    </RadioGroup>

                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Wall Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="wallLength">Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="wallLength" type="number" step="0.1" {...register('wallLength')} />
                                {errors.wallLength && <p className="text-destructive text-sm">{errors.wallLength.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wallHeight">Height ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="wallHeight" type="number" step="0.1" {...register('wallHeight')} />
                                {errors.wallHeight && <p className="text-destructive text-sm">{errors.wallHeight.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="thickness">Plaster Thickness ({unit === 'metric' ? 'mm' : 'in'})</Label>
                           <Input id="thickness" type="number" step="0.1" {...register('thickness')} />
                            {errors.thickness && <p className="text-destructive text-sm">{errors.thickness.message}</p>}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Cement : Sand Ratio</Label>
                        <Controller
                            name="ratio"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(cementSandRatios).map(ratioKey => (
                                            <SelectItem key={ratioKey} value={ratioKey}>{ratioKey}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Materials</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Materials Required</CardTitle>
                   <CardDescription>For a total dry mortar volume of {result.totalVolume.toFixed(2)} {unit === 'metric' ? 'm³' : 'ft³'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Cement</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.cementBags} bags</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Sand</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.sandVolume.toFixed(2)} {unit === 'metric' ? 'm³' : 'ft³'}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`For my plastering project, I need ${result.cementBags} bags of cement and ${result.sandVolume.toFixed(2)} ${unit === 'metric' ? 'cubic meters' : 'cubic feet'} of sand.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Estimate Plaster Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you determine the quantity of cement and sand required for plastering a wall. Accurate measurements are key to a good estimate, and always remember to account for material wastage and the difference between wet and dry volume of mortar.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate the wet volume of plaster needed (Area × Thickness).</li>
                    <li>Convert the wet volume to the required dry volume of materials, which is typically 30-35% more to account for voids in the sand and shrinkage. A wastage factor of 20% is also added.</li>
                    <li>Use the selected cement-sand ratio to determine the individual volumes of cement and sand required from the total dry volume.</li>
                    <li>Convert the calculated cement volume into the number of 50kg bags needed.</li>
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
