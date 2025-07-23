
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
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  cost: z.coerce.number().min(0, 'Cost must be a positive number.'),
  revenue: z.coerce.number().min(0, 'Revenue must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  profitMargin: number;
  grossProfit: number;
};

export default function ProfitMarginCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: undefined,
      revenue: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const grossProfit = data.revenue - data.cost;
    const profitMargin = (grossProfit / data.revenue) * 100;
    
    setResult({
      profitMargin,
      grossProfit
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
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
                <CardTitle className="font-headline text-2xl">Profit Margin Calculator</CardTitle>
                <CardDescription>Calculate the profit margin of your product or service.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Total Cost (₹)</Label>
                    <Input id="cost" type="number" step="0.01" {...register('cost')} />
                    {errors.cost && <p className="text-destructive text-sm">{errors.cost.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="revenue">Total Revenue (₹)</Label>
                    <Input id="revenue" type="number" step="0.01" {...register('revenue')} />
                    {errors.revenue && <p className="text-destructive text-sm">{errors.revenue.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Margin</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Profit Margin Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="text-4xl font-bold text-primary">{result.profitMargin.toFixed(2)}%</div>
                    <p className="text-muted-foreground">Is your profit margin.</p>
                    <div className="text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex justify-between">
                          <span>Gross Profit:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.grossProfit)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My profit margin is ${result.profitMargin.toFixed(2)}%`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               The profit margin is a measure of profitability, calculated as the ratio of profit to revenue. It shows how much profit is generated for each rupee of revenue. A higher profit margin indicates better financial health.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Profit Margin = ((Revenue - Cost) / Revenue) * 100
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is a good profit margin?</AccordionTrigger>
                      <AccordionContent>
                       A "good" profit margin varies widely by industry. A 10% net profit margin is generally considered average, while a 20% margin is considered high and a 5% margin is low.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What's the difference between profit margin and markup?</AccordionTrigger>
                      <AccordionContent>
                       Profit margin shows profit as a percentage of revenue. Markup shows profit as a percentage of cost. They are two different ways of looking at profitability.
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
