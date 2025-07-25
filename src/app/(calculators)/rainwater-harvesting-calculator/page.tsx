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
import { Home, Droplets } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  roofLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  roofWidth: z.coerce.number().min(0.1, 'Width must be positive.'),
  rainfall: z.coerce.number().min(1, 'Rainfall must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  harvestedLiters: number;
  harvestedGallons: number;
};

// The runoff coefficient accounts for water lost to evaporation, spillage, etc.
// 0.8 is a common value for hard surfaces like most roofs.
const RUNOFF_COEFFICIENT = 0.8;

export default function RainwaterHarvestingCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      roofLength: 10,
      roofWidth: 8,
      rainfall: 600,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { roofLength, roofWidth, rainfall, unit } = data;
    
    let harvestedLiters = 0;
    const roofArea = roofLength * roofWidth;

    if (unit === 'metric') {
        // Convert rainfall from mm to m
        const rainfallInMeters = rainfall / 1000;
        const harvestedCubicMeters = roofArea * rainfallInMeters * RUNOFF_COEFFICIENT;
        harvestedLiters = harvestedCubicMeters * 1000;
    } else { // imperial
        // Convert rainfall from inches to feet
        const rainfallInFeet = rainfall / 12;
        const harvestedCubicFeet = roofArea * rainfallInFeet * RUNOFF_COEFFICIENT;
        // 1 cubic foot is approx 28.3168 liters
        harvestedLiters = harvestedCubicFeet * 28.3168;
    }
    
    const harvestedGallons = harvestedLiters * 0.264172;
    
    setResult({
      harvestedLiters,
      harvestedGallons,
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
                <CardTitle className="font-headline text-2xl">Rainwater Harvesting Calculator</CardTitle>
                <CardDescription>Estimate the potential water you can collect from your roof.</CardDescription>
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
                        <h3 className="font-semibold text-sm">Roof Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="roofLength">Roof Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="roofLength" type="number" step="0.1" {...register('roofLength')} />
                                {errors.roofLength && <p className="text-destructive text-sm">{errors.roofLength.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roofWidth">Roof Width ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="roofWidth" type="number" step="0.1" {...register('roofWidth')} />
                                {errors.roofWidth && <p className="text-destructive text-sm">{errors.roofWidth.message}</p>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="rainfall">Average Annual Rainfall ({unit === 'metric' ? 'mm' : 'in'})</Label>
                        <Input id="rainfall" type="number" step="0.1" {...register('rainfall')} />
                        {errors.rainfall && <p className="text-destructive text-sm">{errors.rainfall.message}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Potential</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Annual Collection Potential</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Droplets className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.harvestedLiters.toLocaleString(undefined, { maximumFractionDigits: 0 })} Liters
                    </div>
                    <div className="text-muted-foreground">
                        or {result.harvestedGallons.toLocaleString(undefined, { maximumFractionDigits: 0 })} Gallons (US)
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My roof could potentially harvest ${result.harvestedLiters.toFixed(0)} liters of rainwater per year!`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How Rainwater Harvesting is Calculated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you estimate the volume of rainwater you could potentially collect from a roof surface. This is a crucial first step in designing a rainwater harvesting system for gardening, toilet flushing, or other non-potable uses.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate the total catchment area of your roof (Length × Width).</li>
                    <li>Multiply the roof area by the amount of rainfall in a given period to find the total volume of water that falls on the roof.</li>
                    <li>Apply a runoff coefficient. Not all rain that falls on a roof can be collected due to factors like evaporation, splashing, and roof material absorption. This calculator uses a standard coefficient of 0.8 (meaning 80% of the water is collected).</li>
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
