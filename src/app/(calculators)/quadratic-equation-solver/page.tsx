
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
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    roots: string;
    root1?: number;
    root2?: number;
};

export default function QuadraticEquationSolverPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      a: undefined,
      b: undefined,
      c: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { a, b, c } = data;
    const discriminant = b * b - 4 * a * c;

    if (discriminant > 0) {
      const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      setResult({ roots: 'Two distinct real roots', root1, root2 });
    } else if (discriminant === 0) {
      const root1 = -b / (2 * a);
      setResult({ roots: 'One real root', root1 });
    } else {
      setResult({ roots: 'No real roots (complex roots)' });
    }
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
                            <CardTitle className="font-headline text-2xl">Quadratic Equation Solver</CardTitle>
                            <CardDescription>Solve equations of the form ax² + bx + c = 0.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <p className="text-center text-lg font-medium">Enter coefficients for:</p>
                                <div className="flex items-center justify-center gap-2 text-lg">
                                    <Input id="a" type="number" step="any" placeholder="a" {...register('a')} className="w-20 text-center" />
                                    <span>x² +</span>
                                    <Input id="b" type="number" step="any" placeholder="b" {...register('b')} className="w-20 text-center" />
                                     <span>x +</span>
                                    <Input id="c" type="number" step="any" placeholder="c" {...register('c')} className="w-20 text-center" />
                                    <span>= 0</span>
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
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-lg font-semibold">{result.roots}</div>
                                {result.root1 !== undefined && (
                                    <div className="text-4xl font-bold text-primary">
                                        x₁ = {result.root1.toFixed(4)}
                                    </div>
                                )}
                                {result.root2 !== undefined && (
                                     <div className="text-4xl font-bold text-primary">
                                        x₂ = {result.root2.toFixed(4)}
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`The roots are: ${result.root1 !== undefined ? 'x1=' + result.root1.toFixed(4) : ''} ${result.root2 !== undefined ? 'x2=' + result.root2.toFixed(4) : ''}`.trim()} />
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
                        This calculator finds the roots of a quadratic equation (a polynomial equation of the second degree). The roots are the values of 'x' for which the equation holds true.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <p>The roots are calculated using the quadratic formula:</p>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              x = [-b ± √(b² - 4ac)] / 2a
                          </code>
                          </pre>
                           <p className="mt-2">The value of the discriminant (b² - 4ac) determines the nature of the roots:</p>
                           <ul className="list-disc list-inside mt-2">
                               <li>If positive, there are two distinct real roots.</li>
                               <li>If zero, there is exactly one real root.</li>
                               <li>If negative, there are no real roots (the roots are complex).</li>
                           </ul>
                      </div>
                      </div>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
