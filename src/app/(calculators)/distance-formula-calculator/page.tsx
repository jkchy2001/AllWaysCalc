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
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    distance: number;
};

export default function DistanceFormulaCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      x1: 0,
      y1: 0,
      x2: 3,
      y2: 4,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { x1, y1, x2, y2 } = data;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    setResult({
        distance,
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
                            <CardTitle className="font-headline text-2xl">Distance Formula Calculator</CardTitle>
                            <CardDescription>Calculate the distance between two points in a 2D plane.</CardDescription>
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
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Calculate Distance</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <p className="text-muted-foreground">The distance between the two points is:</p>
                                <div className="text-6xl font-bold text-primary">{result.distance.toFixed(4).replace(/\.?0+$/, '')}</div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`The distance is ${result.distance.toFixed(4)}.`} />
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
                        This calculator uses the Cartesian distance formula, derived from the Pythagorean theorem, to find the straight-line distance between two points on a two-dimensional plane.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              d = √[(x₂ - x₁)² + (y₂ - y₁)²]
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What if I have 3D points?</AccordionTrigger>
                              <AccordionContent>
                                This calculator is designed for 2D points. The distance formula for 3D points (x, y, z) is an extension: d = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²].
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
