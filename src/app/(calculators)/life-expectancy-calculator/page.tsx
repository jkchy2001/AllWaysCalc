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
import { Home, HeartHandshake } from 'lucide-react';
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
  currentAge: z.coerce.number().int().min(18, "Must be at least 18.").max(100, "Please enter a reasonable age."),
  gender: z.enum(['male', 'female']),
  smoking: z.enum(['never', 'former', 'current']),
  exercise: z.enum(['sedentary', 'moderate', 'active']),
  diet: z.enum(['healthy', 'average', 'unhealthy']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  lifeExpectancy: number;
};

// Base life expectancy - a simplified average starting point
const BASE_LIFE_EXPECTANCY = 80;

export default function LifeExpectancyCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: 30,
      gender: 'male',
      smoking: 'never',
      exercise: 'moderate',
      diet: 'average',
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    let expectedAge = BASE_LIFE_EXPECTANCY;
    
    // Gender adjustments
    if (data.gender === 'female') expectedAge += 4;
    else expectedAge -= 2;

    // Smoking adjustments
    if (data.smoking === 'current') expectedAge -= 7;
    if (data.smoking === 'former') expectedAge -= 2;

    // Exercise adjustments
    if (data.exercise === 'active') expectedAge += 5;
    if (data.exercise === 'sedentary') expectedAge -= 5;
    
    // Diet adjustments
    if (data.diet === 'healthy') expectedAge += 4;
    if (data.diet === 'unhealthy') expectedAge -= 4;
    
    // Final check to make sure it's not less than current age
    expectedAge = Math.max(data.currentAge, expectedAge);

    setResult({
      lifeExpectancy: Math.round(expectedAge),
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
                <CardTitle className="font-headline text-2xl">Life Expectancy Calculator</CardTitle>
                <CardDescription>Get a general estimate based on key lifestyle factors.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentAge">Current Age</Label>
                            <Input id="currentAge" type="number" {...register('currentAge')} />
                            {errors.currentAge && <p className="text-destructive text-sm">{errors.currentAge.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Smoking Habits</Label>
                         <Controller
                            name="smoking"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">Never Smoked</SelectItem>
                                        <SelectItem value="former">Former Smoker</SelectItem>
                                        <SelectItem value="current">Current Smoker</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Weekly Exercise</Label>
                         <Controller
                            name="exercise"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                                        <SelectItem value="moderate">Moderate (1-3 times a week)</SelectItem>
                                        <SelectItem value="active">Active (4+ times a week)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Diet Quality</Label>
                         <Controller
                            name="diet"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="healthy">Healthy (Balanced, rich in fruits/veg)</SelectItem>
                                        <SelectItem value="average">Average (Typical diet)</SelectItem>
                                        <SelectItem value="unhealthy">Unhealthy (High in processed foods)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Estimate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Estimated Life Expectancy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <HeartHandshake className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.lifeExpectancy} years
                    </div>
                    <div className="text-muted-foreground">
                        is your estimated life expectancy based on your inputs.
                    </div>
                </CardContent>
                 <CardFooter>
                  <SharePanel resultText={`My estimated life expectancy is ${result.lifeExpectancy} years.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline">Important Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm font-semibold text-destructive">
                This calculator provides a rough estimate for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Life expectancy is influenced by a complex interplay of genetics, lifestyle, environment, and healthcare access that cannot be captured by a simple calculator. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or lifestyle.
                </p>
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>How is this calculated?</AccordionTrigger>
                    <AccordionContent>
                    This tool starts with a baseline average life expectancy and then adjusts this number up or down based on major, evidence-based lifestyle factors like smoking, diet, and exercise. The adjustments are simplified averages and represent a statistical model, not an exact prediction.
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
