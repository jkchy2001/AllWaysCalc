
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
import { Home, Flame } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  weight: z.coerce.number().min(1, "Weight must be positive."),
  steps: z.coerce.number().int().min(1, "Steps must be at least 1."),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  caloriesBurned: number;
};

export default function StepsToCaloriesCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      weight: 70,
      steps: 10000,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let weightInKg = data.weight;
    if (data.unit === 'imperial') {
      weightInKg = data.weight * 0.453592;
    }

    // Assumptions:
    // Average walking speed: 3 mph (4.8 km/h)
    // MET value for walking at 3 mph: 3.5
    // Average steps per minute: 100
    const MET_VALUE = 3.5;
    const durationInMinutes = data.steps / 100;

    const caloriesBurned = (MET_VALUE * 3.5 * weightInKg) / 200 * durationInMinutes;

    setResult({
      caloriesBurned: Math.round(caloriesBurned),
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
                            <CardTitle className="font-headline text-2xl">Steps to Calories Calculator</CardTitle>
                            <CardDescription>Estimate the calories you burned from walking.</CardDescription>
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
                                    <Label htmlFor="steps">Number of Steps Taken</Label>
                                    <Input id="steps" type="number" {...register('steps')} />
                                    {errors.steps && <p className="text-destructive text-sm">{errors.steps.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Calories</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Estimated Calories Burned</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <Flame className="mx-auto size-12 text-primary" />
                                <div className="text-4xl font-bold text-primary">
                                    {result.caloriesBurned.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground">
                                    (approximate calories)
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`I burned approx. ${result.caloriesBurned} calories from walking!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How Calorie Burn is Estimated</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        This calculator provides an estimate of the calories you've burned through walking. The calculation is more than just a simple conversion; it takes into account your body weight and the intensity of the activity.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used (METs)</h3>
                          <p>We use the Metabolic Equivalent of Task (MET) formula, a standard for estimating energy expenditure.</p>
                           <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                           <code>
                                Calories = (METs × 3.5 × Weight in kg) / 200 × Duration in mins
                           </code>
                           </pre>
                           <ul className="list-disc list-inside text-sm mt-2">
                               <li>We assume a MET value of 3.5, typical for moderate-paced walking.</li>
                               <li>Duration is estimated by assuming an average of 100 steps per minute.</li>
                           </ul>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this calculation exact?</AccordionTrigger>
                              <AccordionContent>
                               No, this is a scientifically-backed estimate. Your actual calorie burn can be influenced by your age, sex, fitness level, walking pace, and terrain. This calculator provides a useful baseline.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What is a MET?</AccordionTrigger>
                              <AccordionContent>
                               A MET is a ratio of your working metabolic rate relative to your resting metabolic rate. One MET is the energy you expend sitting at rest. An activity with a MET value of 3.5, like walking, means you're burning 3.5 times the energy than if you were sitting still.
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

