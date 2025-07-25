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
import { Home } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  gender: z.enum(['male', 'female']),
  heightCm: z.coerce.number().optional(),
  heightFt: z.coerce.number().optional(),
  heightIn: z.coerce.number().optional(),
}).refine(data => {
    if (data.unit === 'metric') return data.heightCm && data.heightCm > 0;
    if (data.unit === 'imperial') return data.heightFt && data.heightFt > 0;
    return false;
}, {
    message: "Please fill in the required height fields.",
    path: ['unit'],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  idealWeightKg: number;
  idealWeightLbs: number;
  healthyRangeKg: [number, number];
  healthyRangeLbs: [number, number];
};

export default function IdealWeightCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      gender: 'male',
      heightCm: undefined,
      heightFt: undefined,
      heightIn: 0,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let heightInInches: number;

    if (data.unit === 'metric' && data.heightCm) {
      heightInInches = data.heightCm / 2.54;
    } else if (data.unit === 'imperial' && data.heightFt) {
      heightInInches = (data.heightFt * 12) + (data.heightIn || 0);
    } else {
      return;
    }

    const heightOver5FtInInches = heightInInches - 60;
    let idealWeightKg: number;

    if (heightOver5FtInInches > 0) {
        if (data.gender === 'male') {
            idealWeightKg = 52 + (1.9 * heightOver5FtInInches);
        } else { // female
            idealWeightKg = 49 + (1.7 * heightOver5FtInInches);
        }
    } else {
         // Fallback for heights 5ft and under
        if (data.gender === 'male') {
            idealWeightKg = 52;
        } else {
            idealWeightKg = 49;
        }
    }
    
    const idealWeightLbs = idealWeightKg * 2.20462;

    setResult({
      idealWeightKg,
      idealWeightLbs,
      healthyRangeKg: [idealWeightKg * 0.9, idealWeightKg * 1.1],
      healthyRangeLbs: [idealWeightLbs * 0.9, idealWeightLbs * 1.1],
    });
  };

  const formatWeight = (value: number, unit: 'kg' | 'lbs') => {
      return `${value.toFixed(1)} ${unit}`;
  }

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
                            <CardTitle className="font-headline text-2xl">Ideal Weight Calculator</CardTitle>
                            <CardDescription>Estimate your healthy weight range.</CardDescription>
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
                                        <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            Metric
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                                        <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            Imperial
                                        </Label>
                                    </div>
                                </RadioGroup>
                                
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <RadioGroup
                                        defaultValue="male"
                                        className="flex gap-4 pt-2"
                                        onValueChange={(value) => form.setValue('gender', value as 'male' | 'female')}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="male" id="male" />
                                            <Label htmlFor="male">Male</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="female" id="female" />
                                            <Label htmlFor="female">Female</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                
                                {unit === 'metric' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="heightCm">Height (cm)</Label>
                                        <Input id="heightCm" type="number" placeholder="e.g., 175" {...register('heightCm')} />
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="heightFt">Height (ft)</Label>
                                            <Input id="heightFt" type="number" placeholder="e.g., 5" {...register('heightFt')} />
                                        </div>
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="heightIn">Height (in)</Label>
                                            <Input id="heightIn" type="number" placeholder="e.g., 9" {...register('heightIn')} />
                                        </div>
                                    </div>
                                )}
                                {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Ideal Weight</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Ideal Weight</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-4xl font-bold text-primary">
                                    {unit === 'metric' ? formatWeight(result.idealWeightKg, 'kg') : formatWeight(result.idealWeightLbs, 'lbs')}
                                </div>
                                <div className="text-muted-foreground">
                                    A healthy range for you is approximately:
                                    <p className="font-medium text-foreground">
                                    {unit === 'metric' 
                                        ? `${formatWeight(result.healthyRangeKg[0], 'kg')} - ${formatWeight(result.healthyRangeKg[1], 'kg')}`
                                        : `${formatWeight(result.healthyRangeLbs[0], 'lbs')} - ${formatWeight(result.healthyRangeLbs[1], 'lbs')}`
                                    }
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My ideal weight is around ${formatWeight(result.idealWeightKg, 'kg')}.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Ideal Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          "Ideal weight" is a concept that depends on various factors including height, gender, age, and body composition. This calculator uses a popular formula to provide a general estimate, but it's not a substitute for professional medical advice.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used (Robinson Formula, 1983)</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              <b>For Men:</b> 52 kg + 1.9 kg per inch over 5 feet<br/><br/>
                              <b>For Women:</b> 49 kg + 1.7 kg per inch over 5 feet
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this the same as BMI?</AccordionTrigger>
                              <AccordionContent>
                                No. While related, BMI (Body Mass Index) is a ratio of your weight to your height, which gives a category (like underweight, normal, overweight). This calculator provides a specific weight target in kg or lbs based on your height and gender.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Why is this just an estimate?</AccordionTrigger>
                              <AccordionContent>
                                Formulas like this are based on population averages and don't account for individual differences like bone density, muscle mass, or frame size. An athlete and a non-athlete of the same height might have very different "ideal" weights.
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
