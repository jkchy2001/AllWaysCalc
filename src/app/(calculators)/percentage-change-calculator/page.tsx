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
import { Home, ArrowDown, ArrowUp } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  initialValue: z.coerce.number(),
  finalValue: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    change: number;
    changeType: 'increase' | 'decrease' | 'no-change';
};

export default function PercentageChangeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialValue: undefined,
      finalValue: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    if (data.initialValue === 0) {
        // Handle division by zero case
        setResult({ change: data.finalValue > 0 ? Infinity : 0, changeType: 'increase' });
        return;
    }
    const change = ((data.finalValue - data.initialValue) / data.initialValue) * 100;
    let changeType: CalculationResult['changeType'] = 'no-change';
    if (change > 0) changeType = 'increase';
    if (change < 0) changeType = 'decrease';

    setResult({
        change: parseFloat(change.toFixed(2)),
        changeType,
    });
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
                            <CardTitle className="font-headline text-2xl">Percentage Change Calculator</CardTitle>
                            <CardDescription>Calculate the percentage increase or decrease.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="initialValue">Initial Value</Label>
                                    <Input id="initialValue" type="number" step="any" placeholder="e.g., 100" {...register('initialValue')} />
                                    {errors.initialValue && <p className="text-destructive text-sm">{errors.initialValue.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="finalValue">Final Value</Label>
                                    <Input id="finalValue" type="number" step="any" placeholder="e.g., 120" {...register('finalValue')} />
                                    {errors.finalValue && <p className="text-destructive text-sm">{errors.finalValue.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className={`w-full ${
                            result.changeType === 'increase' ? 'bg-green-100/80 border-green-500' :
                            result.changeType === 'decrease' ? 'bg-red-100/80 border-red-500' :
                            'bg-primary/5'
                        }`}>
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className={`text-6xl font-bold flex items-center justify-center gap-2 ${
                                    result.changeType === 'increase' ? 'text-green-600' :
                                    result.changeType === 'decrease' ? 'text-red-600' :
                                    'text-primary'
                                }`}>
                                    {result.changeType === 'increase' && <ArrowUp className="size-12" />}
                                    {result.changeType === 'decrease' && <ArrowDown className="size-12" />}
                                    {Math.abs(result.change)}%
                                </div>
                                <div className="text-lg text-muted-foreground">
                                   A {result.changeType} of {Math.abs(result.change)}%.
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`The percentage change is ${result.change}%.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        The percentage change calculator determines the percentage difference between two values. It's useful for tracking changes over time, like stock price movements, population growth, or performance improvements.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              Percentage Change = ((Final Value - Initial Value) / Initial Value) * 100
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What does a positive or negative result mean?</AccordionTrigger>
                              <AccordionContent>
                                  A positive result indicates a percentage increase, while a negative result indicates a percentage decrease.
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-2">
                              <AccordionTrigger>What happens if the initial value is zero?</AccordionTrigger>
                              <AccordionContent>
                                  If the initial value is zero, any change results in an infinite percentage increase, as you can't divide by zero. The calculator will indicate this.
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
