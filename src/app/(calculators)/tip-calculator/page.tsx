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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SharePanel } from '@/components/share-panel';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home } from 'lucide-react';

const formSchema = z.object({
  bill: z.coerce.number().min(0, 'Bill amount must be positive'),
  tipPercentage: z.coerce
    .number()
    .min(0, 'Tip percentage must be positive')
    .max(100, 'Tip percentage cannot exceed 100'),
  people: z.coerce
    .number()
    .int()
    .min(1, 'Must be at least one person'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  tipAmount: number;
  totalBill: number;
  perPerson: number;
};

export default function TipCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bill: undefined,
      tipPercentage: 15,
      people: 1,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: FormValues) => {
    const tipAmount = data.bill * (data.tipPercentage / 100);
    const totalBill = data.bill + tipAmount;
    const perPerson = totalBill / data.people;
    setResult({
      tipAmount,
      totalBill,
      perPerson,
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
                <Card className="w-full">
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl">Tip Calculator</CardTitle>
                    <CardDescription>
                        Calculate the tip and total bill for your meal.
                    </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="bill">Bill Amount (₹)</Label>
                         <p className="text-xs text-muted-foreground">The cost of the meal before tip.</p>
                        <Input
                            id="bill"
                            type="number"
                            placeholder="e.g., 500"
                            step="0.01"
                            {...register('bill')}
                        />
                        {errors.bill && <p className="text-destructive text-sm">{errors.bill.message}</p>}
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="tipPercentage">Tip Percentage (%)</Label>
                         <p className="text-xs text-muted-foreground">The percentage of the bill you want to leave as a tip.</p>
                        <Input
                            id="tipPercentage"
                            type="number"
                            placeholder="e.g., 15"
                            {...register('tipPercentage')}
                        />
                        {errors.tipPercentage && <p className="text-destructive text-sm">{errors.tipPercentage.message}</p>}
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="people">Number of People</Label>
                        <p className="text-xs text-muted-foreground">How many people are splitting the bill.</p>
                        <Input id="people" type="number" {...register('people')} />
                        {errors.people && <p className="text-destructive text-sm">{errors.people.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                        Calculate
                        </Button>
                    </CardFooter>
                    </form>
                </Card>
                {result && (
                    <Card className="w-full bg-primary/5">
                    <CardHeader>
                        <CardTitle className="font-headline">Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg">
                        <div className="flex justify-between">
                        <span>Tip Amount:</span>
                        <span className="font-bold">{formatCurrency(result.tipAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                        <span>Total Bill:</span>
                        <span className="font-bold">{formatCurrency(result.totalBill)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-4 mt-4">
                        <span className='font-bold'>Per Person:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(result.perPerson)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <SharePanel resultText={`Tip: ${formatCurrency(result.tipAmount)}, Total: ${formatCurrency(result.totalBill)}, Per Person: ${formatCurrency(result.perPerson)}`} />
                    </CardFooter>
                    </Card>
                )}
                </div>

                <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">How Tipping Works</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                    This calculator helps you determine the appropriate tip for service and split the bill among a group of people. Tipping is a common custom to show appreciation for good service.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                          <AccordionTrigger>Formula Used</AccordionTrigger>
                          <AccordionContent>
                             The calculations are straightforward:
                            <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                            <code>
                                Tip Amount = Bill Amount × (Tip Percentage / 100)<br/>
                                Total Bill = Bill Amount + Tip Amount<br/>
                                Amount Per Person = Total Bill / Number of People
                            </code>
                            </pre>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                          <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold">What's a standard tip percentage?</h4>
                                <p>In many places, a standard tip is typically between 10% and 20% of the pre-tax bill for good service. 15% is a common default.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Should I tip on the total bill or pre-tax amount?</h4>
                                <p>It's customary to tip on the pre-tax amount of the bill. However, some people prefer to tip on the total for simplicity. This calculator applies the tip to the bill amount you enter.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">What about service charges?</h4>
                                <p>Some restaurants automatically add a "service charge" to the bill, especially for large groups. This is essentially a mandatory tip. In such cases, you are generally not expected to leave an additional tip unless the service was exceptional.</p>
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
                        <Link href="/discount-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Discount Calculator</p>
                        </Link>
                        <Link href="/gst-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">GST Calculator</p>
                        </Link>
                        <Link href="/cagr-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">CAGR Calculator</p>
                        </Link>
                        <Link href="/compound-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Compound Interest</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
