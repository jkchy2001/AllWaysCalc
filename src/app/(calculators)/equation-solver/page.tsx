
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
  a: z.coerce.number(),
  b: z.coerce.number(),
  c: z.coerce.number(),
}).refine(data => data.a !== 0, {
    message: "Coefficient 'a' cannot be zero.",
    path: ["a"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    solution: number;
};

export default function EquationSolverPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      a: 2,
      b: 5,
      c: 15,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { a, b, c } = data;
    const solution = (c - b) / a;
    setResult({ solution });
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
                            <CardTitle className="font-headline text-2xl">Linear Equation Solver</CardTitle>
                            <CardDescription>Solve linear equations of the form ax + b = c.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <p className="text-center text-lg font-medium">Enter coefficients for:</p>
                                <div className="flex items-center justify-center gap-2 text-lg">
                                    <Input id="a" type="number" step="any" placeholder="a" {...register('a')} className="w-20 text-center" />
                                    <span>x +</span>
                                    <Input id="b" type="number" step="any" placeholder="b" {...register('b')} className="w-20 text-center" />
                                     <span>=</span>
                                    <Input id="c" type="number" step="any" placeholder="c" {...register('c')} className="w-20 text-center" />
                                </div>
                                {errors.a && <p className="text-destructive text-sm text-center">{errors.a.message}</p>}
                                {errors.b && <p className="text-destructive text-sm text-center">{errors.b.message}</p>}
                                {errors.c && <p className="text-destructive text-sm text-center">{errors.c.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Solve for x</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Solution</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-4xl font-bold text-primary">
                                    x = {result.solution.toFixed(4)}
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`The solution is x = ${result.solution.toFixed(4)}`} />
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
                        This calculator finds the solution for a simple linear equation. A linear equation is an equation for a straight line.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <p>To solve for x in the equation ax + b = c, we use basic algebraic manipulation:</p>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              1. Subtract b from both sides: ax = c - b<br/>
                              2. Divide by a: x = (c - b) / a
                          </code>
                          </pre>
                      </div>
                      </div>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
