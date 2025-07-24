
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
import { Home, Fuel } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  distance: z.coerce.number().min(1, 'Distance must be positive.'),
  efficiency: z.coerce.number().min(0.1, 'Fuel efficiency must be positive.'),
  fuelPrice: z.coerce.number().min(0.1, 'Fuel price must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalCost: number;
  fuelNeeded: number;
};

export default function DistanceFuelCostCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distance: 400,
      efficiency: 15,
      fuelPrice: 100,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const fuelNeeded = data.distance / data.efficiency;
    const totalCost = fuelNeeded * data.fuelPrice;
    
    setResult({
      totalCost,
      fuelNeeded,
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
                <CardTitle className="font-headline text-2xl">Distance & Fuel Cost Calculator</CardTitle>
                <CardDescription>Estimate the fuel cost for a trip.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Total Distance (km)</Label>
                    <Input id="distance" type="number" step="0.1" {...register('distance')} />
                    {errors.distance && <p className="text-destructive text-sm">{errors.distance.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="efficiency">Vehicle Fuel Efficiency (km/L)</Label>
                    <Input id="efficiency" type="number" step="0.1" {...register('efficiency')} />
                    {errors.efficiency && <p className="text-destructive text-sm">{errors.efficiency.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="fuelPrice">Fuel Price (₹ per Liter)</Label>
                    <Input id="fuelPrice" type="number" step="0.01" {...register('fuelPrice')} />
                    {errors.fuelPrice && <p className="text-destructive text-sm">{errors.fuelPrice.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Fuel Cost</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Trip Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">Estimated Fuel Cost</p>
                    <div className="text-4xl font-bold text-primary">{formatCurrency(result.totalCost)}</div>
                    <div className="text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex justify-between">
                          <span>Total Fuel Needed:</span>
                          <span className="font-medium text-foreground">{result.fuelNeeded.toFixed(2)} Liters</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated trip cost is ${formatCurrency(result.totalCost)} for ${form.getValues('distance')} km.`} />
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
