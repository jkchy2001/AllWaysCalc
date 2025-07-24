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
                <CardTitle className="font-headline text-2xl">Break-Even Point Calculator</CardTitle>
                <CardDescription>Find the point where your total costs equal total revenue. This is crucial for understanding the minimum sales your business needs to avoid a loss.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fixedCosts">Total Fixed Costs (₹)</Label>
                    <p className="text-xs text-muted-foreground">Costs that do not change with production level (e.g., rent, salaries).</p>
                    <Input id="fixedCosts" type="number" step="0.01" {...register('fixedCosts')} />
                    {errors.fixedCosts && <p className="text-destructive text-sm">{errors.fixedCosts.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="salesPricePerUnit">Sales Price Per Unit (₹)</Label>
                    <p className="text-xs text-muted-foreground">The price at which you sell one unit of your product.</p>
                    <Input id="salesPricePerUnit" type="number" step="0.01" {...register('salesPricePerUnit')} />
                    {errors.salesPricePerUnit && <p className="text-destructive text-sm">{errors.salesPricePerUnit.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="variableCostPerUnit">Variable Cost Per Unit (₹)</Label>
                    <p className="text-xs text-muted-foreground">The cost to produce one unit of your product (e.g., materials).</p>
                    <Input id="variableCostPerUnit" type="number" step="0.01" {...register('variableCostPerUnit')} />
                    {errors.variableCostPerUnit && <p className="text-destructive text-sm">{errors.variableCostPerUnit.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate</Button>
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
                    <p className="text-muted-foreground">to cover all your costs.</p>
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
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Formula Used</AccordionTrigger>
                  <AccordionContent>
                    <p>The calculation is based on the contribution margin per unit.</p>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Contribution Margin = Sales Price Per Unit - Variable Cost Per Unit<br/>
                      Break-Even Point (Units) = Fixed Costs / Contribution Margin
                    </code>
                  </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Fixed Costs:</strong> Expenses that do not change regardless of the level of production, such as rent, salaries, insurance, and office supplies.</li>
                        <li><strong>Variable Costs:</strong> Expenses that change in direct proportion to the volume of production. This includes raw materials, direct labor, and shipping costs.</li>
                        <li><strong>Sales Price Per Unit:</strong> The amount for which you sell a single product or service.</li>
                        <li><strong>Contribution Margin:</strong> The revenue left over to cover fixed costs after considering variable costs. It's calculated as `Sales Price - Variable Costs`.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>FAQs</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">How can I lower my break-even point?</h4>
                      <p>You can lower your break-even point by reducing fixed costs (e.g., finding cheaper rent), reducing variable costs per unit (e.g., negotiating better prices with suppliers), or increasing the sales price per unit.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Why is this important for a business?</h4>
                      <p>Understanding your break-even point is crucial for setting prices, managing costs, and making informed decisions about your business strategy. It helps you determine the sales volume needed to be profitable and forms the basis for pricing strategies and budget planning.</p>
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
              <Link href="/profit-margin-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Profit Margin Calculator</p>
              </Link>
              <Link href="/markup-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Markup Calculator</p>
              </Link>
              <Link href="/net-profit-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Net Profit Calculator</p>
              </Link>
              <Link href="/npv-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">NPV Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
