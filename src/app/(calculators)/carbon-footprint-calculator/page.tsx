
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carbon Footprint Calculator',
  description: 'Get a simplified estimate of your annual carbon footprint based on key lifestyle areas like electricity use, transport, and diet.',
};

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
import { Home, Leaf } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  electricity: z.coerce.number().min(0, "Electricity usage must be positive."),
  transportDistance: z.coerce.number().min(0, "Distance must be positive."),
  transportMode: z.enum(['car_petrol', 'car_electric', 'bus', 'train']),
  diet: z.enum(['vegan', 'vegetarian', 'average', 'meat_heavy']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalFootprint: number; // in tonnes of CO2e per year
  electricityFootprint: number;
  transportFootprint: number;
  dietFootprint: number;
};

// Emission factors (in kg CO2e per unit) - simplified and indicative
const EMISSION_FACTORS = {
    electricity_kwh: 0.82, // India's average
    car_petrol_km: 0.192,
    car_electric_km: 0.05, // Varies hugely by grid
    bus_km: 0.105,
    train_km: 0.014,
    diet_vegan_yr: 1100,
    diet_vegetarian_yr: 1400,
    diet_average_yr: 1800,
    diet_meat_heavy_yr: 2500,
};

export default function CarbonFootprintCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      electricity: 200,
      transportDistance: 50,
      transportMode: 'car_petrol',
      diet: 'average',
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const electricityFootprint = data.electricity * EMISSION_FACTORS.electricity_kwh * 12; // annual
    const transportFootprint = data.transportDistance * EMISSION_FACTORS[data.transportMode as keyof typeof EMISSION_FACTORS] * 52; // annual
    const dietFootprint = EMISSION_FACTORS[data.diet as keyof typeof EMISSION_FACTORS];

    const totalFootprintKg = electricityFootprint + transportFootprint + dietFootprint;
    const totalFootprintTonnes = totalFootprintKg / 1000;

    setResult({
      totalFootprint: totalFootprintTonnes,
      electricityFootprint: electricityFootprint / 1000,
      transportFootprint: transportFootprint / 1000,
      dietFootprint: dietFootprint / 1000,
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
                <CardTitle className="font-headline text-2xl">Carbon Footprint Calculator</CardTitle>
                <CardDescription>Get a simplified estimate of your annual carbon footprint based on key lifestyle areas.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="electricity">Average Monthly Electricity Use (kWh)</Label>
                    <p className="text-xs text-muted-foreground">Check your utility bill for your average monthly consumption in kilowatt-hours.</p>
                    <Input id="electricity" type="number" {...register('electricity')} />
                    {errors.electricity && <p className="text-destructive text-sm">{errors.electricity.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="transportDistance">Weekly Travel Distance (km)</Label>
                        <p className="text-xs text-muted-foreground">Your average weekly commute and travel distance.</p>
                        <Input id="transportDistance" type="number" {...register('transportDistance')} />
                        {errors.transportDistance && <p className="text-destructive text-sm">{errors.transportDistance.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Primary Mode</Label>
                        <p className="text-xs text-muted-foreground">Your most common mode of transport.</p>
                        <Controller
                            name="transportMode"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="car_petrol">Petrol Car</SelectItem>
                                        <SelectItem value="car_electric">Electric Car</SelectItem>
                                        <SelectItem value="bus">Bus</SelectItem>
                                        <SelectItem value="train">Train</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dietary Habits</Label>
                    <p className="text-xs text-muted-foreground">The production of meat, especially beef, has a high carbon footprint.</p>
                    <Controller
                        name="diet"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vegan">Vegan</SelectItem>
                                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                    <SelectItem value="average">Average (some meat)</SelectItem>
                                    <SelectItem value="meat_heavy">Meat Heavy</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Footprint</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Estimated Annual Footprint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Leaf className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.totalFootprint.toFixed(2)} tonnes CO₂e
                    </div>
                    <div className="text-sm text-muted-foreground pt-4 border-t">
                      <p>Global average is ~4 tonnes. Indian average is ~1.9 tonnes.</p>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-left">
                        <p>Electricity: {result.electricityFootprint.toFixed(2)}t</p>
                        <p>Transport: {result.transportFootprint.toFixed(2)}t</p>
                        <p>Diet: {result.dietFootprint.toFixed(2)}t</p>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated carbon footprint is ${result.totalFootprint.toFixed(2)} tonnes of CO2e per year.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Your Carbon Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by our actions. This calculator provides a simplified estimate based on a few key areas of personal consumption: home energy, transportation, and diet.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Important Disclaimer</AccordionTrigger>
                    <AccordionContent>
                        <p className="font-semibold text-destructive">This is an educational tool, not a scientific analysis. The calculations are based on national and global averages for emission factors and are for illustrative purposes only. Actual emissions can vary greatly based on your specific location, vehicle efficiency, power grid mix, and more complex dietary patterns.</p>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                    <AccordionTrigger>How can I reduce my footprint?</AccordionTrigger>
                    <AccordionContent>
                       <ul className="list-disc list-inside space-y-1">
                          <li>Reduce energy consumption at home by using energy-efficient appliances and being mindful of usage.</li>
                          <li>Opt for public transport, cycling, or walking instead of driving.</li>
                          <li>Reduce consumption of red meat, as it has a significantly higher carbon footprint than other foods.</li>
                          <li>Reduce, reuse, and recycle to minimize waste.</li>
                       </ul>
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
              <Link href="/greenhouse-gas-savings-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Greenhouse Gas Savings</p>
              </Link>
              <Link href="/water-usage-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Water Usage Calculator</p>
              </Link>
              <Link href="/solar-panel-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Solar Panel Calculator</p>
              </Link>
              <Link href="/rainwater-harvesting-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Rainwater Harvesting</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
