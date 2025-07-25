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
import { Home, Trash2 } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  initialInvestment: z.coerce.number().min(0, 'Initial investment must be a positive number.'),
  discountRate: z.coerce.number().min(0, 'Discount rate must be a positive number.'),
  cashFlows: z.array(z.object({ value: z.coerce.number() })).min(1, 'At least one cash flow is required.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  npv: number;
};

export default function NetPresentValueCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: 10000,
      discountRate: 10,
      cashFlows: [{ value: 3000 }, { value: 4200 }, { value: 6800 }],
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "cashFlows",
  });

  const onSubmit = (data: FormValues) => {
    const { initialInvestment, discountRate, cashFlows } = data;
    const rate = discountRate / 100;
    
    const pvOfCashFlows = cashFlows.reduce((acc, flow, index) => {
      return acc + flow.value / Math.pow(1 + rate, index + 1);
    }, 0);
    
    const npv = pvOfCashFlows - initialInvestment;

    setResult({
      npv
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
                <CardTitle className="font-headline text-2xl">Net Present Value (NPV) Calculator</CardTitle>
                <CardDescription>Analyze the profitability of an investment by comparing the present value of future cash flows to the initial investment.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialInvestment">Initial Investment (₹)</Label>
                     <p className="text-xs text-muted-foreground">The total cost of the investment made at the start.</p>
                    <Input id="initialInvestment" type="number" step="0.01" {...register('initialInvestment')} />
                    {errors.initialInvestment && <p className="text-destructive text-sm">{errors.initialInvestment.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="discountRate">Discount Rate (%)</Label>
                    <p className="text-xs text-muted-foreground">The target rate of return or interest rate used to discount future cash flows.</p>
                    <Input id="discountRate" type="number" step="0.01" {...register('discountRate')} />
                    {errors.discountRate && <p className="text-destructive text-sm">{errors.discountRate.message}</p>}
                  </div>
                  <div>
                    <Label>Cash Flows (per period)</Label>
                     <p className="text-xs text-muted-foreground">The cash flow expected in each period (e.g., each year).</p>
                    <div className="space-y-2 mt-2">
                       {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Input
                            type="number"
                            placeholder={`Cash Flow Period ${index + 1}`}
                            {...register(`cashFlows.${index}.value`)}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      ))}
                    </div>
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append({ value: 0 })}
                        >
                        Add Cash Flow
                    </Button>
                     {errors.cashFlows && <p className="text-destructive text-sm mt-2">{errors.cashFlows.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate NPV</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Investment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">The Net Present Value is</p>
                    <div className={`text-4xl font-bold ${result.npv >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {formatCurrency(result.npv)}
                    </div>
                    <p className="text-muted-foreground pt-4 border-t">
                        {result.npv >= 0 ? 'The investment is potentially profitable.' : 'The investment is potentially not profitable.'}
                    </p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The NPV of my investment is ${formatCurrency(result.npv)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Net Present Value (NPV)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Net Present Value (NPV) is a method used in capital budgeting and investment planning to analyze the profitability of a projected investment or project. NPV is the difference between the present value of cash inflows and the present value of cash outflows over a period of time. It accounts for the time value of money, which states that a rupee today is worth more than a rupee tomorrow.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      NPV = Σ [ (Cash Flow / (1 + r)^t) ] - Initial Investment<br/><br/>
                      <b>r</b> = Discount Rate<br/>
                      <b>t</b> = Time period
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What does a positive NPV mean?</AccordionTrigger>
                      <AccordionContent>
                       A positive NPV indicates that the projected earnings generated by a project or investment (in present terms) exceeds the anticipated costs (also in present terms). Generally, an investment with a positive NPV will be a profitable one and should be accepted. A negative NPV means the project is not profitable.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What is the discount rate?</AccordionTrigger>
                      <AccordionContent>
                       The discount rate is a key component of the NPV formula. It's the rate of return used to discount future cash flows back to their present value. It often represents the company's cost of capital, the return on a similar-risk investment, or a desired rate of return. A higher discount rate will result in a lower NPV.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>What are the benefits of using NPV?</AccordionTrigger>
                      <AccordionContent>
                       The main benefit of NPV is that it considers the time value of money, providing a more accurate picture of an investment's profitability than methods that don't (like simple payback period). It provides a clear, absolute value that can be used to compare different projects.
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
              <Link href="/break-even-point-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Break-Even Point</p>
              </Link>
               <Link href="/cagr-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">CAGR Calculator</p>
              </Link>
               <Link href="/profit-margin-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Profit Margin</p>
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
