
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
  revenue: z.coerce.number().min(0, 'Revenue must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  markupPercentage: number;
  profit: number;
};

export default function MarkupCalculatorPage() {
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
    const profit = data.revenue - data.cost;
    const markupPercentage = (profit / data.cost) * 100;
    
    setResult({
      markupPercentage,
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
                <CardTitle className="font-headline text-2xl">Markup Calculator</CardTitle>
                <CardDescription>Calculate the markup percentage on a product's cost.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">Product Cost (₹)</Label>
                    <Input id="cost" type="number" step="0.01" {...register('cost')} />
                    {errors.cost && <p className="text-destructive text-sm">{errors.cost.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="revenue">Selling Price (₹)</Label>
                    <Input id="revenue" type="number" step="0.01" {...register('revenue')} />
                    {errors.revenue && <p className="text-destructive text-sm">{errors.revenue.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Markup</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Markup Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="text-4xl font-bold text-primary">{result.markupPercentage.toFixed(2)}%</div>
                    <p className="text-muted-foreground">Is your markup percentage.</p>
                    <div className="text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex justify-between">
                          <span>Profit:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.profit)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My markup is ${result.markupPercentage.toFixed(2)}%`} />
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
               Markup is the amount added to the cost price of goods to cover overheads and profit. It is the retail price of a product minus its cost, but the markup percentage is calculated in relation to the cost.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Markup Percentage = ((Selling Price - Cost) / Cost) * 100
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Why is markup important?</AccordionTrigger>
                      <AccordionContent>
                       Markup is a key part of pricing strategy. It ensures that the selling price covers all costs and generates a profit.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Is a 100% markup the same as a 50% profit margin?</AccordionTrigger>
                      <AccordionContent>
                       Yes. If you buy something for ₹50 (cost) and sell it for ₹100 (revenue), your profit is ₹50. The markup is 100% (₹50 profit / ₹50 cost). The profit margin is 50% (₹50 profit / ₹100 revenue).
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
