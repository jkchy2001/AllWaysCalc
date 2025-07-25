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
import { Home, UserCheck } from 'lucide-react';
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
  heightCm: z.coerce.number().optional(),
  weightKg: z.coerce.number().optional(),
  heightFt: z.coerce.number().optional(),
  heightIn: z.coerce.number().optional(),
  weightLbs: z.coerce.number().optional(),
}).refine(data => {
    if (data.unit === 'metric') {
        return data.heightCm && data.heightCm > 0 && data.weightKg && data.weightKg > 0;
    }
    if (data.unit === 'imperial') {
        return data.heightFt && data.heightFt > 0 && data.weightLbs && data.weightLbs > 0;
    }
    return false;
}, {
    message: "Please fill in the required fields for the selected unit system.",
    path: ['unit'],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  bmi: number;
  category: string;
};

export default function BmiCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      heightCm: undefined,
      weightKg: undefined,
      heightFt: undefined,
      heightIn: 0,
      weightLbs: undefined,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const unit = watch('unit');

  const getBmiCategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi < 24.9) return 'Normal weight';
    if (bmi >= 25 && bmi < 29.9) return 'Overweight';
    return 'Obesity';
  };
  
  const onSubmit = (data: FormValues) => {
    let bmi: number;
    if (data.unit === 'metric' && data.heightCm && data.weightKg) {
      const heightInMeters = data.heightCm / 100;
      bmi = data.weightKg / (heightInMeters * heightInMeters);
    } else if (data.unit === 'imperial' && data.heightFt && data.weightLbs) {
      const totalHeightInInches = (data.heightFt * 12) + (data.heightIn || 0);
      bmi = (data.weightLbs / (totalHeightInInches * totalHeightInInches)) * 703;
    } else {
        return;
    }
    
    setResult({
      bmi: parseFloat(bmi.toFixed(1)),
      category: getBmiCategory(bmi),
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
                            <CardTitle className="font-headline text-2xl">Body Mass Index (BMI) Calculator</CardTitle>
                            <CardDescription>Calculate your BMI to assess your weight status using metric or imperial units.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    defaultValue="metric"
                                    className="grid grid-cols-2 gap-4"
                                    onValueChange={(value) => form.setValue('unit', value as 'metric' | 'imperial')}
                                    {...register('unit')}
                                >
                                    <div>
                                        <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                                        <Label htmlFor="metric" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            Metric Units
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                                        <Label htmlFor="imperial" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            Imperial Units
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {unit === 'metric' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heightCm">Height (cm)</Label>
                                            <p className="text-xs text-muted-foreground">Your height in centimeters.</p>
                                            <Input id="heightCm" type="number" placeholder="e.g., 175" {...register('heightCm')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="weightKg">Weight (kg)</Label>
                                            <p className="text-xs text-muted-foreground">Your weight in kilograms.</p>
                                            <Input id="weightKg" type="number" placeholder="e.g., 70" {...register('weightKg')} />
                                        </div>
                                    </div>
                                )}

                                {unit === 'imperial' && (
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="space-y-2 w-1/2">
                                                <Label htmlFor="heightFt">Height (ft)</Label>
                                                 <p className="text-xs text-muted-foreground">Your height in feet.</p>
                                                <Input id="heightFt" type="number" placeholder="e.g., 5" {...register('heightFt')} />
                                            </div>
                                            <div className="space-y-2 w-1/2">
                                                <Label htmlFor="heightIn">Height (in)</Label>
                                                 <p className="text-xs text-muted-foreground">And inches.</p>
                                                <Input id="heightIn" type="number" placeholder="e.g., 9" {...register('heightIn')} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="weightLbs">Weight (lbs)</Label>
                                            <p className="text-xs text-muted-foreground">Your weight in pounds.</p>
                                            <Input id="weightLbs" type="number" placeholder="e.g., 155" {...register('weightLbs')} />
                                        </div>
                                    </div>
                                )}
                                {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate BMI</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your BMI Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <UserCheck className="mx-auto size-12 text-primary" />
                                <div className="text-6xl font-bold text-primary">{result.bmi}</div>
                                <div className="text-2xl font-semibold">{result.category}</div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Healthy BMI range: 18.5 kg/m² - 25 kg/m².</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My BMI is ${result.bmi} (${result.category})`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding BMI</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          Body Mass Index (BMI) is a measure that uses your height and weight to work out if your weight is healthy. It's a widely used screening tool for identifying potential weight problems in adults.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Formulas Used</AccordionTrigger>
                              <AccordionContent>
                                The calculator uses the standard formulas for BMI calculation:
                                  <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                                  <code>
                                      <b>Metric:</b> BMI = weight (kg) / [height (m)]²<br/><br/>
                                      <b>Imperial:</b> BMI = [weight (lbs) / (height (in))²] * 703
                                  </code>
                                  </pre>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>FAQs</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Is BMI an accurate measure of health?</h4>
                                    <p>BMI is a useful screening tool, but it doesn't tell the whole story. It doesn't account for body composition (like muscle vs. fat). For example, a very muscular person might have a high BMI but be perfectly healthy. For a complete health assessment, it's best to consult a healthcare professional.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Why are there different categories?</h4>
                                    <p>The categories (Underweight, Normal, Overweight, Obesity) are based on World Health Organization (WHO) guidelines and help indicate potential health risks associated with weight. They serve as a general guide to help you understand where your weight falls on a broad spectrum.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Does BMI work for children?</h4>
                                    <p>No, this calculator is for adults. For children and teens, BMI is calculated using the same formula but the results are interpreted differently, using age- and sex-specific percentile charts.</p>
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
                        <Link href="/bmr-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">BMR Calculator</p>
                        </Link>
                        <Link href="/body-fat-percentage-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Body Fat Percentage</p>
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
