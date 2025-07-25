'use client';

import type { Metadata } from 'next';
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
import { Home, LineChart } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  totalProduction: z.coerce.number().min(0.1, 'Production must be positive.'),
  totalArea: z.coerce.number().min(0.1, 'Area must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  yield: number;
};

export default function CropYieldCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      totalProduction: 10000,
      totalArea: 2,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    const { totalProduction, totalArea } = data;
    
    const cropYield = totalProduction / totalArea;
    
    setResult({
      yield: cropYield,
    });
  };
  
  const unitLabels = unit === 'metric' 
    ? { production: 'kg', area: 'hectares', yield: 'kg/ha' }
    : { production: 'lbs', area: 'acres', yield: 'lbs/acre' };

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
                <CardTitle className="font-headline text-2xl">Crop Yield Calculator</CardTitle>
                <CardDescription>Calculate your crop yield per unit of area.</CardDescription>
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
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (kg/ha)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (lbs/acre)</Label>
                        </div>
                    </RadioGroup>

                    <div className="p-4 border rounded-md space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalProduction">Total Production ({unitLabels.production})</Label>
                            <Input id="totalProduction" type="number" step="0.1" {...register('totalProduction')} />
                            {errors.totalProduction && <p className="text-destructive text-sm">{errors.totalProduction.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalArea">Total Area ({unitLabels.area})</Label>
                            <Input id="totalArea" type="number" step="0.1" {...register('totalArea')} />
                            {errors.totalArea && <p className="text-destructive text-sm">{errors.totalArea.message}</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Yield</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Crop Yield</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <LineChart className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.yield.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-muted-foreground">
                        {unitLabels.yield}
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My crop yield is ${result.yield.toFixed(2)} ${unitLabels.yield}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How Crop Yield is Calculated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Crop yield is a measure of the amount of a crop harvested per unit of land area. It is a critical indicator of agricultural productivity. This calculator helps farmers and agronomists easily compute this essential metric.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Yield = Total Production / Total Area
                    </code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="mt-8">
              <CardHeader>
                <CardTitle>Related Calculators</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/fertilizer-requirement-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Fertilizer Requirement</p>
                </Link>
                <Link href="/rainwater-harvesting-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Rainwater Harvesting</p>
                </Link>
                <Link href="/carbon-footprint-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Carbon Footprint</p>
                </Link>
                <Link href="/solar-panel-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Solar Panel</p>
                </Link>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
