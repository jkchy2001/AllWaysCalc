
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
  fixedCosts: z.coerce.number().min(0, 'Fixed costs must be a positive number.'),
  salesPricePerUnit: z.coerce.number().min(0.01, 'Sales price must be greater than zero.'),
  variableCostPerUnit: z.coerce.number().min(0, 'Variable cost must be a positive number.'),
}).refine(data => data.salesPricePerUnit > data.variableCostPerUnit, {
    message: "Sales price per unit must be greater than variable cost per unit.",
    path: ["salesPricePerUnit"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  breakEvenUnits: number;
  breakEvenRevenue: number;
};

export default function BreakEvenPointCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fixedCosts: undefined,
      salesPricePerUnit: undefined,
      variableCostPerUnit: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const contributionMargin = data.salesPricePerUnit - data.variableCostPerUnit;
    const breakEvenUnits = data.fixedCosts / contributionMargin;
    const breakEvenRevenue = breakEvenUnits * data.salesPricePerUnit;
    
    setResult({
      breakEvenUnits,
      breakEvenRevenue
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
                <CardTitle className="font-headline text-2xl">Break-Even Point Calculator</CardTitle>
                <CardDescription>Find the point where your total costs equal total revenue.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fixedCosts">Total Fixed Costs (₹)</Label>
                    <Input id="fixedCosts" type="number" step="0.01" {...register('fixedCosts')} />
                    {errors.fixedCosts && <p className="text-destructive text-sm">{errors.fixedCosts.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="salesPricePerUnit">Sales Price Per Unit (₹)</Label>
                    <Input id="salesPricePerUnit" type="number" step="0.01" {...register('salesPricePerUnit')} />
                    {errors.salesPricePerUnit && <p className="text-destructive text-sm">{errors.salesPricePerUnit.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="variableCostPerUnit">Variable Cost Per Unit (₹)</Label>
                    <Input id="variableCostPerUnit" type="number" step="0.01" {...register('variableCostPerUnit')} />
                    {errors.variableCostPerUnit && <p className="text-destructive text-sm">{errors.variableCostPerUnit.message}</p>}
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
                  <CardTitle className="font-headline">Break-Even Point</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">You need to sell</p>
                    <div className="text-4xl font-bold text-primary">{Math.ceil(result.breakEvenUnits).toLocaleString()} units</div>
                    <p className="text-muted-foreground">to break even.</p>
                     <div className="text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex justify-between">
                          <span>Break-Even Revenue:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.breakEvenRevenue)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My break-even point is ${Math.ceil(result.breakEvenUnits)} units.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Break-Even Point</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               The break-even point (BEP) in economics, business—and specifically cost accounting—is the point at which total cost and total revenue are equal, i.e. "even". There is no net loss or gain, and one has "broken even", though opportunity costs have been paid and capital has received the risk-adjusted, expected return.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Break-Even Point (Units) = Fixed Costs / (Sales Price Per Unit - Variable Cost Per Unit)
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What are fixed vs. variable costs?</AccordionTrigger>
                      <AccordionContent>
                       Fixed costs do not change with the number of units produced (e.g., rent, salaries). Variable costs change with production volume (e.g., raw materials, direct labor).
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>How can I lower my break-even point?</AccordionTrigger>
                      <AccordionContent>
                       You can lower your break-even point by reducing fixed costs, reducing variable costs per unit, or increasing the sales price per unit.
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
