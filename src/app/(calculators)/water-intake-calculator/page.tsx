
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
import { Home, Droplet } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  weight: z.coerce.number().min(1, "Weight must be positive."),
  exerciseDuration: z.coerce.number().min(0, "Exercise duration cannot be negative."),
  climate: z.enum(['temperate', 'hot']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalLiters: number;
  totalOunces: number;
};

export default function WaterIntakeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      weight: 70,
      exerciseDuration: 30,
      climate: 'temperate',
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let weightInLbs = data.weight;
    if (data.unit === 'metric') {
      weightInLbs = data.weight * 2.20462;
    }

    // Baseline: 2/3 of weight in ounces
    let baseIntakeOz = weightInLbs * (2 / 3);

    // Add for exercise: 12 oz for every 30 minutes
    const exerciseIntakeOz = (data.exerciseDuration / 30) * 12;
    let totalIntakeOz = baseIntakeOz + exerciseIntakeOz;

    // Adjust for climate
    if (data.climate === 'hot') {
        totalIntakeOz *= 1.15; // Add 15% for hot climates
    }
    
    const totalLiters = totalIntakeOz * 0.0295735;

    setResult({
      totalLiters,
      totalOunces: totalIntakeOz,
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
                            <CardTitle className="font-headline text-2xl">Daily Water Intake Calculator</CardTitle>
                            <CardDescription>Estimate your recommended daily water consumption.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>Units</Label>
                                        <RadioGroup
                                            defaultValue="metric"
                                            value={unit}
                                            onValueChange={(value) => form.setValue('unit', value as 'metric' | 'imperial')}
                                            className="flex gap-4 pt-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="metric" id="metric" />
                                                <Label htmlFor="metric">Metric (kg)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="imperial" id="imperial" />
                                                <Label htmlFor="imperial">Imperial (lbs)</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Your Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Label>
                                        <Input id="weight" type="number" {...register('weight')} />
                                        {errors.weight && <p className="text-destructive text-sm">{errors.weight.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exerciseDuration">Daily Exercise (minutes)</Label>
                                    <Input id="exerciseDuration" type="number" {...register('exerciseDuration')} />
                                    {errors.exerciseDuration && <p className="text-destructive text-sm">{errors.exerciseDuration.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Primary Climate</Label>
                                    <Select onValueChange={(val) => form.setValue('climate', val as 'temperate' | 'hot')} defaultValue={watch('climate')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select climate" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="temperate">Temperate / Cool</SelectItem>
                                            <SelectItem value="hot">Hot / Humid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Intake</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Recommended Daily Water Intake</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <Droplet className="mx-auto size-12 text-primary" />
                                <div className="text-4xl font-bold text-primary">
                                    {result.totalLiters.toFixed(2)} Liters
                                </div>
                                <div className="text-muted-foreground">
                                    (approximately {result.totalOunces.toFixed(1)} ounces)
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My estimated daily water intake is ${result.totalLiters.toFixed(2)} liters.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">The Importance of Hydration</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          Staying hydrated is crucial for your health. Water regulates body temperature, keeps joints lubricated, prevents infections, delivers nutrients to cells, and keeps organs functioning properly. Being well-hydrated also improves sleep quality, cognition, and mood.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">How is this calculated?</h3>
                          <p>This calculator provides an estimate based on common recommendations:</p>
                          <ul className="list-disc list-inside mt-2 space-y-1 bg-muted p-4 rounded-md">
                            <li>A baseline intake is determined by your weight.</li>
                            <li>Additional water is added to compensate for fluid loss during exercise.</li>
                            <li>A final adjustment is made for living in a hotter climate, which increases fluid loss through sweat.</li>
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this an exact number?</AccordionTrigger>
                              <AccordionContent>
                               No, this is an estimate. Individual needs can vary based on factors like overall health, diet, and medications. It's a great starting point, but the best advice is to drink when you feel thirsty.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Do other drinks count towards this total?</AccordionTrigger>
                              <AccordionContent>
                               Yes, fluids from other beverages like tea, coffee, and juice, as well as from water-rich foods like fruits and vegetables, contribute to your total hydration. However, plain water is the best source of hydration.
                              </AccordionContent>
                          </AccordionItem>
                          </Accordion>
                      </div>
                      </div>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
