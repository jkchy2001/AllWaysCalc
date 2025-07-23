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
  x1: z.coerce.number(),
  y1: z.coerce.number(),
  x2: z.coerce.number(),
  y2: z.coerce.number(),
}).refine(data => data.x1 !== data.x2, {
    message: "Slope is undefined (vertical line). x₁ and x₂ cannot be the same.",
    path: ["x2"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    slope: number;
};

export default function SlopeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      x1: 2,
      y1: 3,
      x2: 7,
      y2: 5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { x1, y1, x2, y2 } = data;
    const slope = (y2 - y1) / (x2 - x1);
    setResult({
        slope,
    });
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
                            <CardTitle className="font-headline text-2xl">Slope Calculator</CardTitle>
                            <CardDescription>Calculate the slope of a line from two points.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="p-4 border rounded-md space-y-4">
                                    <h3 className="font-semibold">Point 1 (x₁, y₁)</h3>
                                    <div className="flex gap-4">
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="x1">x₁</Label>
                                            <Input id="x1" type="number" step="any" {...register('x1')} />
                                        </div>
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="y1">y₁</Label>
                                            <Input id="y1" type="number" step="any" {...register('y1')} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-md space-y-4">
                                    <h3 className="font-semibold">Point 2 (x₂, y₂)</h3>
                                    <div className="flex gap-4">
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="x2">x₂</Label>
                                            <Input id="x2" type="number" step="any" {...register('x2')} />
                                        </div>
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="y2">y₂</Label>
                                            <Input id="y2" type="number" step="any" {...register('y2')} />
                                        </div>
                                    </div>
                                </div>
                                {errors.x2 && <p className="text-destructive text-sm">{errors.x2.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Slope</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <p className="text-muted-foreground">The slope (m) of the line is:</p>
                                <div className="text-6xl font-bold text-primary">{result.slope.toFixed(4).replace(/\.?0+$/, '')}</div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`The slope is ${result.slope.toFixed(4)}.`} />
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
                        The slope of a line is a measure of its steepness, calculated as "rise over run". It represents the rate of change in y for a unit change in x.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              m = (y₂ - y₁) / (x₂ - x₁)
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What does the slope value mean?</AccordionTrigger>
                              <AccordionContent>
                                A positive slope means the line goes up from left to right. A negative slope means it goes down. A slope of 0 means it's a horizontal line. An undefined slope (when x₂ = x₁) means it's a vertical line.
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
