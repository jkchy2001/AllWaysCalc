
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Home, Droplets, Trash2 } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const activitySchema = z.object({
  name: z.string(),
  litersPerUse: z.coerce.number(),
  usesPerWeek: z.coerce.number().min(0),
});

const formSchema = z.object({
  activities: z.array(activitySchema),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalLitersPerWeek: number;
  totalGallonsPerWeek: number;
  breakdown: { name: string; weeklyUsage: number; percentage: number }[];
};

const defaultActivities = [
  { name: 'Shower (per minute)', litersPerUse: 9, usesPerWeek: 35 },
  { name: 'Bath', litersPerUse: 130, usesPerWeek: 2 },
  { name: 'Toilet Flush', litersPerUse: 6, usesPerWeek: 35 },
  { name: 'Dishwasher Cycle', litersPerUse: 15, usesPerWeek: 4 },
  { name: 'Laundry Load', litersPerUse: 50, usesPerWeek: 3 },
  { name: 'Hand Washing Dishes (per minute)', litersPerUse: 8, usesPerWeek: 20 },
];


export default function WaterUsageCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activities: defaultActivities,
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  const onSubmit = (data: FormValues) => {
    const weeklyBreakdown = data.activities.map(activity => ({
      name: activity.name,
      weeklyUsage: activity.litersPerUse * activity.usesPerWeek,
    }));
    
    const totalLitersPerWeek = weeklyBreakdown.reduce((sum, item) => sum + item.weeklyUsage, 0);

    const breakdownWithPercentage = weeklyBreakdown.map(item => ({
        ...item,
        percentage: totalLitersPerWeek > 0 ? (item.weeklyUsage / totalLitersPerWeek) * 100 : 0
    }));

    setResult({
      totalLitersPerWeek,
      totalGallonsPerWeek: totalLitersPerWeek * 0.264172,
      breakdown: breakdownWithPercentage,
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
                <CardTitle className="font-headline text-2xl">Household Water Usage Calculator</CardTitle>
                <CardDescription>Estimate your weekly water consumption based on daily activities.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Household Activities</Label>
                    <p className="text-xs text-muted-foreground mb-2">Adjust the weekly uses for each activity. You can also add your own.</p>
                     <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_80px_80px_auto] items-center gap-2">
                          <Input
                            placeholder="Activity Name"
                            defaultValue={field.name}
                            {...register(`activities.${index}.name`)}
                            className="text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Liters/use"
                            defaultValue={field.litersPerUse}
                            {...register(`activities.${index}.litersPerUse`)}
                          />
                          <Input
                            type="number"
                            placeholder="Uses/week"
                            defaultValue={field.usesPerWeek}
                            {...register(`activities.${index}.usesPerWeek`)}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', litersPerUse: 1, usesPerWeek: 1 })}>
                      Add Custom Activity
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Water Usage</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Estimated Weekly Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center border-b pb-4">
                        <Droplets className="mx-auto size-12 text-primary" />
                        <div className="text-4xl font-bold text-primary">
                            {result.totalLitersPerWeek.toLocaleString(undefined, { maximumFractionDigits: 0 })} Liters
                        </div>
                        <div className="text-muted-foreground">
                           or {result.totalGallonsPerWeek.toLocaleString(undefined, { maximumFractionDigits: 0 })} Gallons
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-center">Usage Breakdown</h4>
                        <Table>
                            <TableBody>
                                {result.breakdown.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className='text-right'>{item.percentage.toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My household uses about ${result.totalLitersPerWeek.toFixed(0)} liters of water per week.`} />
                </CardFooter>
              </Card>
            </Card>
          </Card>
        </div>
      </main>
    </div>
  );
}
