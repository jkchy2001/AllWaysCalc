
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
  height: z.coerce.number().min(1, "Height must be positive."),
  neck: z.coerce.number().min(1, "Neck measurement must be positive."),
  waist: z.coerce.number().min(1, "Waist measurement must be positive."),
  hip: z.coerce.number().optional(),
}).refine(data => {
    if (data.gender === 'female') {
        return data.hip && data.hip > 0;
    }
    return true;
}, {
    message: "Hip measurement is required for females.",
    path: ["hip"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  bodyFatPercentage: number;
};

export default function BodyFatPercentageCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      gender: 'male',
      height: undefined,
      neck: undefined,
      waist: undefined,
      hip: undefined,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');
  const gender = watch('gender');

  const onSubmit = (data: FormValues) => {
    let { height, neck, waist, hip } = data;

    // Convert all measurements to cm if they are in inches
    if (data.unit === 'imperial') {
        height *= 2.54;
        neck *= 2.54;
        waist *= 2.54;
        if (hip) hip *= 2.54;
    }

    let bodyFatPercentage: number;

    if (data.gender === 'male') {
        bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else { // female
        bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waist + (hip || 0) - neck) + 0.22100 * Math.log10(height)) - 450;
    }
    
    setResult({
      bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
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
                            <CardTitle className="font-headline text-2xl">Body Fat Percentage Calculator</CardTitle>
                            <CardDescription>Estimate your body fat percentage using the U.S. Navy method, which only requires a tape measure.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <RadioGroup
                                        defaultValue="metric"
                                        value={unit}
                                        onValueChange={(value) => form.setValue('unit', value as 'metric' | 'imperial')}
                                        className="col-span-2 grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                                Metric (cm)
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                                Imperial (in)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Gender</Label>
                                        <RadioGroup
                                            defaultValue="male"
                                            className="flex gap-4 pt-2"
                                            value={gender}
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
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                    <Input id="height" type="number" step="0.1" {...register('height')} />
                                    {errors.height && <p className="text-destructive text-sm">{errors.height.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="neck">Neck ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                        <p className="text-xs text-muted-foreground">Measure around your neck, below the larynx.</p>
                                        <Input id="neck" type="number" step="0.1" {...register('neck')} />
                                        {errors.neck && <p className="text-destructive text-sm">{errors.neck.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="waist">Waist ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                        <p className="text-xs text-muted-foreground">Measure at the navel for men, narrowest point for women.</p>
                                        <Input id="waist" type="number" step="0.1" {...register('waist')} />
                                        {errors.waist && <p className="text-destructive text-sm">{errors.waist.message}</p>}
                                    </div>
                                </div>
                                
                                {gender === 'female' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="hip">Hip ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                        <p className="text-xs text-muted-foreground">Measure around the widest part of your hips/buttocks.</p>
                                        <Input id="hip" type="number" step="0.1" {...register('hip')} />
                                        {errors.hip && <p className="text-destructive text-sm">{errors.hip.message}</p>}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate Body Fat</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.bodyFatPercentage}%</div>
                                <div className="text-lg text-muted-foreground">
                                    Estimated Body Fat Percentage
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My estimated body fat percentage is ${result.bodyFatPercentage}%.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Body Fat Percentage</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This calculator uses a method developed by the U.S. Navy to estimate body fat percentage based on simple body measurements. It's a convenient way to track your body composition without special equipment.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Formula Used</AccordionTrigger>
                              <AccordionContent>
                                  The U.S. Navy method uses height, neck, waist, and (for women) hip measurements in a logarithmic formula to estimate body fat.
                                  <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                                  <code>
                                      <b>Men:</b> %Fat = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450<br/><br/>
                                      <b>Women:</b> %Fat = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
                                  </code>
                                  </pre>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>FAQs</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Is this calculator accurate?</h4>
                                    <p>While methods like DEXA scans are more precise, the U.S. Navy formula is considered a good estimator for most people. Consistency in how you measure is key to tracking changes over time.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Why is body fat percentage important?</h4>
                                    <p>Body fat percentage is a better indicator of health than just weight or BMI because it distinguishes between fat mass and lean mass (muscles, bones, water). Maintaining a healthy body fat percentage is important for overall fitness and reducing the risk of certain diseases.</p>
                                </div>
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
                         <Link href="/ideal-weight-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Ideal Weight</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
