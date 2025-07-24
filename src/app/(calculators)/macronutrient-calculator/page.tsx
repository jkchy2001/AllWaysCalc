
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
import { Home } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const dietPlans = {
    balanced: { name: 'Balanced', protein: 30, carbs: 40, fat: 30 },
    lowCarb: { name: 'Low Carb', protein: 40, carbs: 25, fat: 35 },
    highProtein: { name: 'High Protein', protein: 50, carbs: 30, fat: 20 },
    keto: { name: 'Ketogenic', protein: 25, carbs: 5, fat: 70 },
};

type DietPlan = keyof typeof dietPlans;

const formSchema = z.object({
  calories: z.coerce.number().min(1, 'Daily calories must be a positive number.'),
  dietPlan: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  protein: number;
  carbs: number;
  fat: number;
};

export default function MacronutrientCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calories: 2000,
      dietPlan: 'balanced',
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const plan = dietPlans[data.dietPlan as DietPlan];
    
    const proteinGrams = (data.calories * (plan.protein / 100)) / 4;
    const carbGrams = (data.calories * (plan.carbs / 100)) / 4;
    const fatGrams = (data.calories * (plan.fat / 100)) / 9;

    setResult({
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fat: Math.round(fatGrams),
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
                <CardTitle className="font-headline text-2xl">Macronutrient Calculator</CardTitle>
                <CardDescription>Calculate your daily protein, carb, and fat intake.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Daily Calorie Goal</Label>
                    <Input id="calories" type="number" {...register('calories')} />
                    {errors.calories && <p className="text-destructive text-sm">{errors.calories.message}</p>}
                  </div>
                   <div className="space-y-2">
                        <Label>Select Diet Plan</Label>
                        <Controller
                            name="dietPlan"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a diet plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(dietPlans).map(([key, {name}]) => (
                                            <SelectItem key={key} value={key}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Macros</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Daily Macronutrient Goals</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Protein</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.protein}g</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Carbohydrates</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.carbs}g</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Fat</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.fat}g</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My daily macros: ${result.protein}g Protein, ${result.carbs}g Carbs, ${result.fat}g Fat.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Macronutrients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Macronutrients, or "macros," are the three main types of nutrients that provide your body with energy: protein, carbohydrates, and fat. Balancing them correctly is key to achieving your health and fitness goals.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Calorie Conversion</h3>
                   <ul className="list-disc list-inside mt-2 space-y-1 bg-muted p-4 rounded-md">
                     <li><b>Protein:</b> 4 calories per gram. Essential for building and repairing tissues.</li>
                     <li><b>Carbohydrates:</b> 4 calories per gram. The body's main source of energy.</li>
                     <li><b>Fat:</b> 9 calories per gram. Important for hormone production and nutrient absorption.</li>
                   </ul>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Which diet plan is best for me?</AccordionTrigger>
                      <AccordionContent>
                       The best plan depends on your personal goals, lifestyle, and preferences. A balanced diet is a great starting point for overall health. High-protein diets are often used for muscle building, while low-carb diets can be effective for weight loss. It's always best to consult a healthcare professional.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Do I have to hit these numbers exactly?</AccordionTrigger>
                      <AccordionContent>
                       No, think of these as targets, not strict rules. Aim to be close to these numbers on average over the week. Consistency is more important than perfection on any single day.
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
