
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
import { Home, Recycle } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  drivingDistance: z.coerce.number().min(0).default(0),
  electricitySaved: z.coerce.number().min(0).default(0),
  dietChange: z.enum(['none', 'to_vegetarian', 'to_vegan']).default('none'),
  compostAmount: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalSavings: number;
  breakdown: { name: string; savings: number }[];
};

// Simplified emission factors (in kg CO2e per unit/year)
const EMISSION_FACTORS = {
    petrol_to_ev_per_km: 0.142, // Difference between avg petrol and avg EV in India
    electricity_per_kwh: 0.82, // India's average grid emission factor
    diet_avg_to_veg: 400, // Annual savings from average to vegetarian
    diet_avg_to_vegan: 700, // Annual savings from average to vegan
    compost_per_kg: 1.5, // Savings from avoiding landfill methane emissions
};

export default function GreenhouseGasSavingsCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drivingDistance: 0,
      electricitySaved: 0,
      dietChange: 'none',
      compostAmount: 0,
    },
  });

  const { register, handleSubmit, control } = form;

  const onSubmit = (data: FormValues) => {
    const breakdown: { name: string; savings: number }[] = [];

    const drivingSavings = data.drivingDistance * EMISSION_FACTORS.petrol_to_ev_per_km;
    if (drivingSavings > 0) breakdown.push({ name: 'Driving (EV Switch)', savings: drivingSavings });
    
    const electricitySavings = data.electricitySaved * EMISSION_FACTORS.electricity_per_kwh * 12;
    if (electricitySavings > 0) breakdown.push({ name: 'Electricity Savings', savings: electricitySavings });
    
    let dietSavings = 0;
    if (data.dietChange === 'to_vegetarian') dietSavings = EMISSION_FACTORS.diet_avg_to_veg;
    if (data.dietChange === 'to_vegan') dietSavings = EMISSION_FACTORS.diet_avg_to_vegan;
    if (dietSavings > 0) breakdown.push({ name: 'Dietary Change', savings: dietSavings });

    const compostSavings = data.compostAmount * EMISSION_FACTORS.compost_per_kg;
    if (compostSavings > 0) breakdown.push({ name: 'Composting Waste', savings: compostSavings });

    const totalSavings = breakdown.reduce((sum, item) => sum + item.savings, 0);

    setResult({
      totalSavings,
      breakdown,
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
                <CardTitle className="font-headline text-2xl">Greenhouse Gas Savings Calculator</CardTitle>
                <CardDescription>Estimate how your positive actions reduce your carbon footprint.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="drivingDistance">Annual driving switched from petrol to EV (km)</Label>
                    <Input id="drivingDistance" type="number" {...register('drivingDistance')} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="electricitySaved">Monthly electricity saved (kWh)</Label>
                    <Input id="electricitySaved" type="number" {...register('electricitySaved')} />
                  </div>
                  
                   <div className="space-y-2">
                    <Label>Dietary Change (from typical meat-eating)</Label>
                    <Controller
                        name="dietChange"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Change</SelectItem>
                                    <SelectItem value="to_vegetarian">Switched to Vegetarian</SelectItem>
                                    <SelectItem value="to_vegan">Switched to Vegan</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compostAmount">Annual food waste composted (kg)</Label>
                    <Input id="compostAmount" type="number" {...register('compostAmount')} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Savings</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Estimated Annual Savings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center border-b pb-4">
                        <Recycle className="mx-auto size-12 text-primary" />
                        <div className="text-4xl font-bold text-primary">
                            {result.totalSavings.toFixed(2)} kg CO₂e
                        </div>
                        <div className="text-muted-foreground">
                            is your estimated annual greenhouse gas reduction.
                        </div>
                    </div>
                     {result.breakdown.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-center">Savings Breakdown</h4>
                            <Table>
                                <TableBody>
                                    {result.breakdown.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell className='text-right'>{item.savings.toFixed(2)} kg</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My actions are saving an estimated ${result.totalSavings.toFixed(2)} kg of CO2e per year!`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator uses simplified, averaged data for emission factors to provide a general estimate. Actual savings can vary significantly based on your specific car, your local electricity grid's energy sources, and many other factors. This tool is for educational purposes to illustrate the impact of positive environmental choices.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
