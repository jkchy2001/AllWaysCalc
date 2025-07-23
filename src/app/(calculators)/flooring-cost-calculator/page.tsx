
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
import { Home, WalletCards } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  areaLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  areaWidth: z.coerce.number().min(0.1, 'Width must be positive.'),
  costPerUnit: z.coerce.number().min(0.01, 'Cost must be positive.'),
  wastage: z.coerce.number().min(0).max(100).default(10),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalCost: number;
  totalArea: number;
};

export default function FlooringCostCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      areaLength: 5,
      areaWidth: 4,
      costPerUnit: 500,
      wastage: 10,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    const { areaLength, areaWidth, costPerUnit, wastage } = data;

    const totalArea = areaLength * areaWidth;
    const areaWithWastage = totalArea * (1 + wastage / 100);
    const totalCost = areaWithWastage * costPerUnit;
    
    setResult({
      totalCost,
      totalArea,
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
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
                <CardTitle className="font-headline text-2xl">Flooring Cost Calculator</CardTitle>
                <CardDescription>Estimate the material cost for your flooring project.</CardDescription>
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
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (m)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (ft)</Label>
                        </div>
                    </RadioGroup>

                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Area Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="areaLength">Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="areaLength" type="number" step="0.1" {...register('areaLength')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="areaWidth">Width ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="areaWidth" type="number" step="0.1" {...register('areaWidth')} />
                            </div>
                        </div>
                    </div>
                    
                     <div className="space-y-2">
                        <Label htmlFor="costPerUnit">Cost per square {unit === 'metric' ? 'meter' : 'foot'} (₹)</Label>
                        <Input id="costPerUnit" type="number" step="0.01" {...register('costPerUnit')} />
                        {errors.costPerUnit && <p className="text-destructive text-sm">{errors.costPerUnit.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wastage">Wastage (%)</Label>
                        <Input id="wastage" type="number" {...register('wastage')} />
                        <p className="text-xs text-muted-foreground">Recommended: 10-15% for cuts and mistakes.</p>
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Cost</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Estimated Cost</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <WalletCards className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {formatCurrency(result.totalCost)}
                    </div>
                    <div className="text-muted-foreground">
                        To cover {result.totalArea.toFixed(2)} {unit === 'metric' ? 'm²' : 'ft²'}, including wastage.
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated flooring material cost is ${formatCurrency(result.totalCost)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Estimate Flooring Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you budget for your next flooring project by estimating the total material cost.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate the total area of the floor (Length × Width).</li>
                    <li>Add a wastage percentage (typically 10-15%) to this area to account for cuts, trimming, and mistakes.</li>
                    <li>Multiply the total area (including wastage) by the cost per square meter/foot to get the total estimated material cost.</li>
                  </ol>
                   <p className="text-sm font-semibold mt-4 text-destructive">Note: This calculator estimates material costs only and does not include the cost of labor, underlayment, adhesive, or other installation supplies.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
