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
  cost: z.coerce.number().min(0.01, 'Cost must be greater than zero.'),
  markupPercentage: z.coerce.number().min(0, 'Markup must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  sellingPrice: number;
  profit: number;
};

export default function MarkupCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: undefined,
      markupPercentage: 50,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const profit = data.cost * (data.markupPercentage / 100);
    const sellingPrice = data.cost + profit;
    
    setResult({
      sellingPrice,
      profit
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
                <CardTitle className="font-headline text-2xl">Markup Calculator</CardTitle>
                <CardDescription>Determine the optimal selling price for your products by applying a desired markup percentage to your costs.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Product Cost (₹)</Label>
                    <p className="text-xs text-muted-foreground">Enter the total cost to acquire or produce one unit of your product.</p>
                    <Input id="cost" type="number" step="0.01" {...register('cost')} />
                    {errors.cost && <p className="text-destructive text-sm">{errors.cost.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
                    <p className="text-xs text-muted-foreground">Enter the percentage you want to add to the cost to determine the selling price.</p>
                    <Input id="markupPercentage" type="number" step="0.01" {...register('markupPercentage')} />
                    {errors.markupPercentage && <p className="text-destructive text-sm">{errors.markupPercentage.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate Selling Price</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Pricing Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">The required selling price is</p>
                    <div className="text-4xl font-bold text-primary">{formatCurrency(result.sellingPrice)}</div>
                    <div className="text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex justify-between">
                          <span>Profit per unit:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.profit)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`To get a ${form.getValues('markupPercentage')}% markup, the selling price should be ${formatCurrency(result.sellingPrice)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Markup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Markup is the amount added to the cost price of goods to cover overheads and profit. It is a key part of pricing strategy to ensure profitability.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Selling Price = Cost + (Cost * (Markup Percentage / 100))
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What's the difference between Markup and Margin?</AccordionTrigger>
                      <AccordionContent>
                       Markup is the percentage of profit relative to the cost (Profit / Cost). Profit Margin is the percentage of profit relative to the selling price (Profit / Revenue). They are two different but related ways of looking at profitability. A 50% markup is equivalent to a 33.3% profit margin.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Why is markup important for a business?</AccordionTrigger>
                      <AccordionContent>
                      Setting the right markup is crucial for covering all business expenses (like rent, salaries, and marketing) and ensuring the business generates a sustainable profit. It's a fundamental step in building a viable pricing model.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
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
               <Link href="/discount-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Discount Calculator</p>
              </Link>
              <Link href="/break-even-point-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Break-Even Point</p>
              </Link>
               <Link href="/gst-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">GST Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
