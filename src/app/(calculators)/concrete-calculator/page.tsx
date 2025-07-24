
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
import { Home, Landmark } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  length: z.coerce.number().min(0.1, 'Length must be positive.'),
  width: z.coerce.number().min(0.1, 'Width must be positive.'),
  thickness: z.coerce.number().min(0.1, 'Thickness must be positive.'),
  wastage: z.coerce.number().min(0).max(100).default(5),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalVolume: number;
};

export default function ConcreteCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      length: 5,
      width: 4,
      thickness: 10, // cm for metric, inches for imperial
      wastage: 5,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { length, width, thickness, wastage, unit } = data;
    
    let volume = 0;
    if (unit === 'metric') {
        // convert thickness from cm to m
        thickness /= 100;
        volume = length * width * thickness; // volume in cubic meters
    } else { // imperial
        // convert thickness from inches to feet
        thickness /= 12;
        volume = (length * width * thickness) / 27; // volume in cubic yards
    }

    const totalVolume = volume * (1 + wastage / 100);
    
    setResult({
      totalVolume,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                <CardTitle className="font-headline text-2xl">Concrete Calculator</CardTitle>
                <CardDescription>Estimate the volume of concrete needed for a slab.</CardDescription>
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
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (m/cm)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (ft/in)</Label>
                        </div>
                    </RadioGroup>

                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Slab Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="length">Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="length" type="number" step="0.1" {...register('length')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="width">Width ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="width" type="number" step="0.1" {...register('width')} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="thickness">Thickness ({unit === 'metric' ? 'cm' : 'in'})</Label>
                            <Input id="thickness" type="number" step="0.1" {...register('thickness')} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="wastage">Wastage (%)</Label>
                        <Input id="wastage" type="number" {...register('wastage')} />
                        <p className="text-xs text-muted-foreground">Recommended: 5-10% for spillage and uneven ground.</p>
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate Volume</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">You will need</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Landmark className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.totalVolume.toFixed(2)} {unit === 'metric' ? 'm³' : 'yd³'}
                    </div>
                    <div className="text-muted-foreground">
                        of concrete, including wastage.
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I'll need about ${result.totalVolume.toFixed(2)} ${unit === 'metric' ? 'cubic meters' : 'cubic yards'} of concrete.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Estimate Concrete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you determine the volume of concrete required for a simple rectangular slab. Accurate measurements are crucial for ordering the correct amount.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate the volume of the slab (Length × Width × Thickness).</li>
                    <li>Ensure all units are consistent before multiplying (e.g., convert thickness in cm/inches to m/feet).</li>
                    <li>Add a wastage percentage (typically 5-10%) to account for spillage, over-excavation, or uneven surfaces.</li>
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
