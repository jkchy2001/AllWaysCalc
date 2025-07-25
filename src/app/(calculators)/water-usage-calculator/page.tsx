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
    })).sort((a, b) => b.weeklyUsage - a.weeklyUsage);

    setResult({
      totalLitersPerWeek,
      totalGallonsPerWeek: totalLitersPerWeek * 0.264172,
      breakdown: breakdownWithPercentage,
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
                <CardTitle className="font-headline text-2xl">Household Water Usage Calculator</CardTitle>
                <CardDescription>Estimate your weekly water consumption based on daily activities and identify areas for conservation.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Household Activities</Label>
                    <p className="text-xs text-muted-foreground mb-2">Adjust the Liters/Use and Uses/Week for each activity. You can also add your own.</p>
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
                  <Button type="submit" className="w-full">Calculate Water Usage</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Your Estimated Weekly Usage</CardTitle>
                  <CardDescription>A breakdown of your household's water consumption.</CardDescription>
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
            )}
          </div>
           <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Water Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Understanding where your household uses the most water is the first step toward conservation. This calculator helps you visualize your consumption patterns based on common household activities. The pre-filled values are averages and can be adjusted to better reflect your actual usage.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How can I reduce my water usage?</AccordionTrigger>
                  <AccordionContent>
                    Based on your results, target the activities with the highest percentage. Simple changes like taking shorter showers, installing low-flow fixtures, running full loads in the dishwasher and washing machine, and fixing leaks can lead to significant water savings.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Where do these default values come from?</AccordionTrigger>
                  <AccordionContent>
                    The default "Liters per Use" values are based on averages for common household fixtures. For example, older toilets can use up to 13 liters per flush, while modern efficient ones use 6 liters or less. A standard showerhead uses about 9 liters per minute. You can adjust these values to match your own appliances for a more accurate estimate.
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
                <Link href="/carbon-footprint-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Carbon Footprint</p>
                </Link>
                <Link href="/rainwater-harvesting-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Rainwater Harvesting</p>
                </Link>
                <Link href="/solar-panel-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Solar Panel Calculator</p>
                </Link>
                <Link href="/greenhouse-gas-savings-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Greenhouse Gas Savings</p>
                </Link>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
