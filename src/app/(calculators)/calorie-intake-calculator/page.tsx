
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Calorie Intake Calculator',
  description: 'Estimate your daily calorie needs to maintain, lose, or gain weight. Personalized results based on your activity level, age, height, and gender.',
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  activityLevel: z.enum(['sedentary', 'lightly', 'moderately', 'very', 'super']),
  goal: z.enum(['lose', 'maintain', 'gain']),
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
  maintenance: number;
  loseWeight: number;
  gainWeight: number;
};

const activityLevels = {
    sedentary: { value: 1.2, label: 'Sedentary (little or no exercise)' },
    lightly: { value: 1.375, label: 'Lightly active (light exercise 1-3 days/week)' },
    moderately: { value: 1.55, label: 'Moderately active (moderate exercise 3-5 days/week)' },
    very: { value: 1.725, label: 'Very active (hard exercise 6-7 days/week)' },
    super: { value: 1.9, label: 'Super active (very hard exercise & physical job)' },
};

export default function CalorieIntakeCalculatorPage() {
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
      activityLevel: 'lightly',
      goal: 'maintain',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

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
    if (data.gender === 'male') {
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age + 5;
    } else {
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * data.age - 161;
    }
    
    const activityMultiplier = activityLevels[data.activityLevel].value;
    const maintenanceCalories = bmr * activityMultiplier;
    
    setResult({
      maintenance: Math.round(maintenanceCalories),
      loseWeight: Math.round(maintenanceCalories - 500),
      gainWeight: Math.round(maintenanceCalories + 500),
    });
  };
  
  const formatNumber = (value: number) => {
      return new Intl.NumberFormat('en-IN').format(value);
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
                            <CardTitle className="font-headline text-2xl">Daily Calorie Intake Calculator</CardTitle>
                            <CardDescription>Estimate your daily calorie needs based on your activity and goals to maintain, lose, or gain weight.</CardDescription>
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
                                
                                <div className="space-y-2">
                                    <Label>Activity Level</Label>
                                    <p className="text-xs text-muted-foreground">How active are you on a weekly basis?</p>
                                    <Select onValueChange={(val) => setValue('activityLevel', val as FormValues['activityLevel'])} defaultValue={watch('activityLevel')}>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select your activity level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {Object.entries(activityLevels).map(([key, {label}]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Daily Calorie Goals</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className='p-4 bg-background rounded-lg'>
                                    <p className="text-muted-foreground">To maintain your weight:</p>
                                    <p className="text-3xl font-bold text-primary">{formatNumber(result.maintenance)} Calories/day</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className='p-4 bg-background rounded-lg'>
                                        <p className="text-muted-foreground">To lose weight:</p>
                                        <p className="text-2xl font-bold text-primary">{formatNumber(result.loseWeight)} Calories/day</p>
                                    </div>
                                    <div className='p-4 bg-background rounded-lg'>
                                        <p className="text-muted-foreground">To gain weight:</p>
                                        <p className="text-2xl font-bold text-primary">{formatNumber(result.gainWeight)} Calories/day</p>
                                    </div>
                                </div>
                                <p className='text-xs text-muted-foreground pt-2'>Based on a deficit/surplus of 500 calories for a loss/gain of approx. 0.5 kg (1 lb) per week.</p>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My maintenance calories are ${formatNumber(result.maintenance)} per day.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How Calorie Intake is Calculated</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                          This calculator estimates your Total Daily Energy Expenditure (TDEE) to help you set calorie goals for weight management.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Methodology (Harris-Benedict Principle)</AccordionTrigger>
                              <AccordionContent>
                                  <ol className="list-decimal list-inside space-y-2 mt-2">
                                    <li>First, we calculate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation, which is based on your weight, height, age, and gender.</li>
                                    <li>Then, we multiply your BMR by an activity factor based on your exercise level to find your maintenance calories (TDEE).</li>
                                    <li>Finally, we provide estimates for weight loss (a 500 calorie deficit) or weight gain (a 500 calorie surplus), which generally corresponds to a loss or gain of about 0.5 kg (1 lb) per week.</li>
                                  </ol>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>FAQs</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">What is TDEE?</h4>
                                    <p>TDEE stands for Total Daily Energy Expenditure. It's an estimation of how many calories you burn per day when exercise is taken into account. It is the number of calories you would need to eat to maintain your current weight.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Is this calculator 100% accurate?</h4>
                                    <p>No calculator is perfect. These formulas provide a good starting point, but individual metabolisms can vary. Use these results as a guideline and adjust based on your real-world progress. The best approach is to monitor your weight over a couple of weeks and adjust your calorie intake up or down as needed.</p>
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
                         <Link href="/macronutrient-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Macronutrient Calculator</p>
                        </Link>
                         <Link href="/body-fat-percentage-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Body Fat Percentage</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
