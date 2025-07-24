
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMR (Basal Metabolic Rate) Calculator',
  description: 'Calculate your Basal Metabolic Rate (BMR) - the number of calories your body needs at rest to function. A key metric for weight management and fitness planning.',
};

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
  age: z.coerce.number().int().min(1, 'Age must be positive.'),
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
  bmr: number;
};

export default function BmrCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      gender: 'male',
      age: 25,
      heightCm: undefined,
      weightKg: undefined,
      heightFt: undefined,
      heightIn: 0,
      weightLbs: undefined,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let weightInKg: number;
    let heightInCm: number;

    if (data.unit === 'metric' && data.weightKg && data.heightCm) {
        weightInKg = data.weightKg;
        heightInCm = data.heightCm;
    } else if (data.unit === 'imperial' && data.weightLbs && data.heightFt) {
        weightInKg = data.weightLbs * 0.453592;
        heightInCm = ((data.heightFt * 12) + (data.heightIn || 0)) * 2.54;
    } else {
        return;
    }

    let bmr: number;
    // Mifflin-St Jeor Equation
    if (data.gender === 'male') {
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age + 5;
    } else { // female
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age - 161;
    }
    
    setResult({
      bmr: Math.round(bmr),
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
                            <CardTitle className="font-headline text-2xl">Basal Metabolic Rate (BMR) Calculator</CardTitle>
                            <CardDescription>Calculate the minimum number of calories your body needs at rest to function.</CardDescription>
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
                                            Metric Units
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                                        <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            Imperial Units
                                        </Label>
                                    </div>
                                </RadioGroup>
                                
                                <div className='grid grid-cols-2 gap-4'>
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
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input id="age" type="number" {...register('age')} />
                                    </div>
                                </div>
                                

                                {unit === 'metric' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heightCm">Height (cm)</Label>
                                            <Input id="heightCm" type="number" placeholder="e.g., 175" {...register('heightCm')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="weightKg">Weight (kg)</Label>
                                            <Input id="weightKg" type="number" placeholder="e.g., 70" {...register('weightKg')} />
                                        </div>
                                    </div>
                                )}

                                {unit === 'imperial' && (
                                    <div className="space-y-4">
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
                                        <div className="space-y-2">
                                            <Label htmlFor="weightLbs">Weight (lbs)</Label>
                                            <Input id="weightLbs" type="number" placeholder="e.g., 155" {...register('weightLbs')} />
                                        </div>
                                    </div>
                                )}
                                {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate BMR</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your BMR Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.bmr.toLocaleString()}</div>
                                <div className="text-xl font-semibold">Calories / day</div>
                                <div className="text-sm text-muted-foreground">
                                    <p>This is the number of calories your body needs to perform basic, life-sustaining functions if you were to rest for 24 hours.</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My BMR is ${result.bmr} calories/day.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding BMR</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          Basal Metabolic Rate (BMR) is the number of calories your body needs to accomplish its most basic (basal) life-sustaining functions, such as breathing, circulation, nutrient processing, and cell production.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Formula Used (Mifflin-St Jeor)</AccordionTrigger>
                              <AccordionContent>
                                This calculator uses the Mifflin-St Jeor equation, which is considered one of the most accurate methods for estimating BMR. The formula is:
                                  <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                                  <code>
                                      <b>For Men:</b> 10 * weight (kg) + 6.25 * height (cm) - 5 * age (years) + 5<br/><br/>
                                      <b>For Women:</b> 10 * weight (kg) + 6.25 * height (cm) - 5 * age (years) - 161
                                  </code>
                                  </pre>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>FAQs</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">How can I use my BMR?</h4>
                                    <p>Your BMR is the starting point for determining your total daily calorie needs. To find out how many calories you actually burn in a day, you need to multiply your BMR by an activity factor. This gives you your Total Daily Energy Expenditure (TDEE). To lose weight, you need to consume fewer calories than your TDEE.</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Is this calculator 100% accurate?</h4>
                                    <p>BMR formulas provide a good estimate, but they are not perfectly accurate for every individual. Factors like body composition (a person with more muscle will have a higher BMR than a person of the same weight with more fat), genetics, and specific health conditions can influence your actual BMR.</p>
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
