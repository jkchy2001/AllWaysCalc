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
    <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                        <Home className="size-4" /> Home
                    </Link>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Daily Water Intake Calculator</CardTitle>
                            <CardDescription>Get a personalized estimate of your daily water needs based on weight, exercise, and climate.</CardDescription>
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
                                     <p className="text-xs text-muted-foreground">Enter the total time you spend exercising per day.</p>
                                    <Input id="exerciseDuration" type="number" {...register('exerciseDuration')} />
                                    {errors.exerciseDuration && <p className="text-destructive text-sm">{errors.exerciseDuration.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Primary Climate</Label>
                                     <p className="text-xs text-muted-foreground">Your body needs more water in hot and humid conditions.</p>
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
                                <Button type="submit" className="w-full">Calculate Intake</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Recommended Daily Water Intake</CardTitle>
                                 <CardDescription>This is your estimated daily goal for optimal hydration.</CardDescription>
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
                 <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                      <CardTitle className="font-headline">The Importance of Hydration</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          Staying hydrated is crucial for your health. Water regulates body temperature, keeps joints lubricated, prevents infections, delivers nutrients to cells, and keeps organs functioning properly. Being well-hydrated also improves sleep quality, cognition, and mood.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>How is this calculated?</AccordionTrigger>
                              <AccordionContent>
                              This calculator provides an estimate based on common recommendations:
                              <ul className="list-disc list-inside mt-2 space-y-1 pl-4">
                                <li>A baseline intake is determined by your weight (approximately 2/3 of your body weight in pounds, converted to ounces).</li>
                                <li>Additional water (12 oz) is added for every 30 minutes of exercise to compensate for fluid loss.</li>
                                <li>A final adjustment (15% increase) is made for living in a hotter climate, which increases fluid loss through sweat.</li>
                              </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Is this an exact number?</AccordionTrigger>
                              <AccordionContent>
                               No, this is an estimate. Individual needs can vary based on factors like overall health, diet, and medications. It's a great starting point, but the best advice is to listen to your body and drink when you feel thirsty. Your urine color is also a good indicator: pale yellow is ideal, while dark yellow can be a sign of dehydration.
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-3">
                              <AccordionTrigger>Do other drinks count towards this total?</AccordionTrigger>
                              <AccordionContent>
                               Yes, fluids from other beverages like tea, coffee, and juice, as well as from water-rich foods like fruits and vegetables, contribute to your total hydration. However, plain water is the best and purest source of hydration, without added sugars or calories.
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
                    <Link href="/bmi-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                      <p className="font-semibold">BMI Calculator</p>
                    </Link>
                    <Link href="/bmr-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                      <p className="font-semibold">BMR Calculator</p>
                    </Link>
                     <Link href="/calorie-intake-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                      <p className="font-semibold">Calorie Intake</p>
                    </Link>
                     <Link href="/heart-rate-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                      <p className="font-semibold">Heart Rate Calculator</p>
                    </Link>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
