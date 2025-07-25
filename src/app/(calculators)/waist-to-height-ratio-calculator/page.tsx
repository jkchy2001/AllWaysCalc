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
  waist: z.coerce.number().min(1, "Waist must be positive."),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  ratio: number;
  category: string;
};

const getCategory = (ratio: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
        if (ratio < 0.43) return 'Underweight';
        if (ratio <= 0.52) return 'Healthy';
        if (ratio <= 0.57) return 'Overweight';
        if (ratio <= 0.62) return 'Very Overweight';
        return 'Morbidly Obese';
    } else { // female
        if (ratio < 0.42) return 'Underweight';
        if (ratio <= 0.48) return 'Healthy';
        if (ratio <= 0.53) return 'Overweight';
        if (ratio <= 0.57) return 'Very Overweight';
        return 'Morbidly Obese';
    }
};

export default function WaistToHeightRatioCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      gender: 'male',
      height: 175,
      waist: 80,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    // No unit conversion needed as long as they are consistent
    const ratio = data.waist / data.height;
    
    setResult({
      ratio: parseFloat(ratio.toFixed(2)),
      category: getCategory(ratio, data.gender),
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
                            <CardTitle className="font-headline text-2xl">Online Waist-to-Height Ratio Calculator</CardTitle>
                            <CardDescription>Assess your body shape and potential cardiometabolic health risks using the WHtR metric.</CardDescription>
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
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="height">Height ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                        <Input id="height" type="number" placeholder="e.g., 175" {...register('height')} />
                                        {errors.height && <p className="text-destructive text-sm">{errors.height.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="waist">Waist ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                        <Input id="waist" type="number" placeholder="e.g., 80" {...register('waist')} />
                                        {errors.waist && <p className="text-destructive text-sm">{errors.waist.message}</p>}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate Ratio</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Result</CardTitle>
                                 <CardDescription>Your calculated WHtR and what it means.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.ratio}</div>
                                <div className="text-2xl font-semibold">{result.category}</div>
                                <div className="text-sm text-muted-foreground">
                                    <p>A healthy ratio is generally considered to be below 0.5.</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My Waist-to-Height Ratio is ${result.ratio} (${result.category})`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Waist-to-Height Ratio (WHtR)</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          The Waist-to-Height Ratio (WHtR) is a simple measurement used to assess body fat distribution. It is often considered a better predictor of cardiometabolic risk than BMI because it accounts for central (abdominal) fat.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>How is WHtR calculated?</AccordionTrigger>
                              <AccordionContent>
                                The formula is straightforward:
                                <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                                <code>
                                    Ratio = Waist Circumference / Height
                                </code>
                                </pre>
                                <p className="mt-2">It is crucial that both measurements are in the same units (e.g., both in cm or both in inches).</p>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What do the results mean?</AccordionTrigger>
                              <AccordionContent>
                                A simple guideline is to keep your waist circumference to less than half your height (a ratio of &lt;0.5). A ratio above this may indicate an increased risk of obesity-related health issues like heart disease and type 2 diabetes. This calculator provides a more detailed breakdown based on gender.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>How do I measure my waist circumference correctly?</AccordionTrigger>
                              <AccordionContent>
                                <b>Waist:</b> Find the point halfway between your lowest rib and the top of your hip bone (this is usually just above your belly button).
                                <br/><br/>
                                For both measurements, keep the tape measure snug but not tight against the skin, and ensure it is parallel to the floor.
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
                     <Link href="/body-fat-percentage-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                      <p className="font-semibold">Body Fat Percentage</p>
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
