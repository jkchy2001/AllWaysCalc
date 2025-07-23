
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
  revenue: z.coerce.number().min(0, 'Revenue must be a positive number.'),
  cogs: z.coerce.number().min(0, 'Cost of Goods Sold must be a positive number.'),
  operatingExpenses: z.coerce.number().min(0, 'Operating Expenses must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  netProfit: number;
  netProfitMargin: number;
};

export default function NetProfitCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: undefined,
      cogs: undefined,
      operatingExpenses: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const grossProfit = data.revenue - data.cogs;
    const netProfit = grossProfit - data.operatingExpenses;
    const netProfitMargin = (netProfit / data.revenue) * 100;
    
    setResult({
      netProfit,
      netProfitMargin,
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
                <CardTitle className="font-headline text-2xl">Net Profit Calculator</CardTitle>
                <CardDescription>Calculate your business's net profit and margin.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Total Revenue (₹)</Label>
                    <Input id="revenue" type="number" step="0.01" {...register('revenue')} />
                    {errors.revenue && <p className="text-destructive text-sm">{errors.revenue.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="cogs">Cost of Goods Sold (COGS) (₹)</Label>
                    <Input id="cogs" type="number" step="0.01" {...register('cogs')} />
                    {errors.cogs && <p className="text-destructive text-sm">{errors.cogs.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="operatingExpenses">Operating Expenses (₹)</Label>
                    <Input id="operatingExpenses" type="number" step="0.01" {...register('operatingExpenses')} />
                    {errors.operatingExpenses && <p className="text-destructive text-sm">{errors.operatingExpenses.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Net Profit</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Profitability Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">Your Net Profit is</p>
                    <div className="text-4xl font-bold text-primary">{formatCurrency(result.netProfit)}</div>
                    <div className="text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex justify-between">
                          <span>Net Profit Margin:</span>
                          <span className="font-medium text-foreground">{result.netProfitMargin.toFixed(2)}%</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My net profit is ${formatCurrency(result.netProfit)} with a ${result.netProfitMargin.toFixed(2)}% margin.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               Net profit is the amount of money your business has left over after subtracting all costs from your total revenue. It's one of the most important indicators of a company's financial health, often referred to as the "bottom line".
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Net Profit = (Total Revenue - COGS - Operating Expenses)
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What's the difference between Gross Profit and Net Profit?</AccordionTrigger>
                      <AccordionContent>
                       Gross profit is revenue minus the Cost of Goods Sold (COGS). Net profit takes it a step further by also subtracting operating expenses, interest, and taxes from the gross profit.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What are operating expenses?</AccordionTrigger>
                      <AccordionContent>
                       Operating expenses are the costs a business incurs that are not directly related to the production of a product. Examples include rent, utilities, marketing, and salaries for administrative staff.
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
