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
  a: z.coerce.number().optional(),
  b: z.coerce.number().optional(),
  c: z.coerce.number().optional(),
  d: z.coerce.number().optional(),
  e: z.coerce.number().optional(),
}).refine(data => (data.a || 0) - (data.d || 0) !== 0, {
    message: "'a' coefficient cannot be zero after rearrangement.",
    path: ["a"],
});


type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    roots: string;
    root1?: number;
    root2?: number;
    discriminant: number;
    finalA: number;
    finalB: number;
    finalC: number;
};

export default function QuadraticEquationSolverPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      a: 1,
      b: 5,
      c: 6,
      d: 0,
      e: 0,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const finalA = (data.a || 0) - (data.d || 0);
    const finalB = (data.b || 0) - (data.e || 0);
    const finalC = data.c || 0;
    
    const discriminant = finalB * finalB - 4 * finalA * finalC;

    if (discriminant > 0) {
      const root1 = (-finalB + Math.sqrt(discriminant)) / (2 * finalA);
      const root2 = (-finalB - Math.sqrt(discriminant)) / (2 * finalA);
      setResult({ roots: 'Two distinct real roots', root1, root2, discriminant, finalA, finalB, finalC });
    } else if (discriminant === 0) {
      const root1 = -finalB / (2 * finalA);
      setResult({ roots: 'One real root', root1, discriminant, finalA, finalB, finalC });
    } else {
      const realPart = (-finalB / (2 * finalA)).toFixed(4);
      const imagPart = (Math.sqrt(-discriminant) / (2 * finalA)).toFixed(4);
      setResult({
        roots: `Two complex roots: ${realPart.replace(/\.?0+$/, '')} ± ${imagPart.replace(/\.?0+$/, '')}i`,
        discriminant, finalA, finalB, finalC
      });
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
                            <CardDescription>Solve equations of the form ax² + bx + c = dx² + ex.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <p className="text-center text-lg font-medium">Enter coefficients for your equation. Leave fields blank for 0.</p>
                                <div className="flex items-center justify-center gap-2 text-lg">
                                    <Input id="a" type="number" step="any" placeholder="a" {...register('a')} className="w-16 text-center" />
                                    <span>x² +</span>
                                    <Input id="b" type="number" step="any" placeholder="b" {...register('b')} className="w-16 text-center" />
                                     <span>x +</span>
                                    <Input id="c" type="number" step="any" placeholder="c" {...register('c')} className="w-16 text-center" />
                                </div>
                                <div className="flex items-center justify-center text-2xl font-bold">=</div>
                                <div className="flex items-center justify-center gap-2 text-lg">
                                    <Input id="d" type="number" step="any" placeholder="d" {...register('d')} className="w-16 text-center" />
                                    <span>x² +</span>
                                    <Input id="e" type="number" step="any" placeholder="e" {...register('e')} className="w-16 text-center" />
                                     <span>x</span>
                                </div>
                                 {errors.a && <p className="text-destructive text-sm text-center">{errors.a.message}</p>}
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
                            <CardContent className="space-y-4">
                               <div className="text-center">
                                    <p className="text-muted-foreground">The discriminant (b² - 4ac) is {result.discriminant.toFixed(4).replace(/\.?0+$/, '')}, so there are</p>
                                    <div className="text-lg font-semibold my-1 text-primary">{result.roots}</div>
                               </div>

                               <div className="space-y-2 text-center">
                                {result.root1 !== undefined && (
                                    <div className="text-3xl font-bold text-primary">
                                        x₁ = {result.root1.toFixed(4).replace(/\.?0+$/, '')}
                                    </div>
                                )}
                                {result.root2 !== undefined && (
                                     <div className="text-3xl font-bold text-primary">
                                        x₂ = {result.root2.toFixed(4).replace(/\.?0+$/, '')}
                                    </div>
                                )}
                               </div>
                               <div className="text-sm text-muted-foreground pt-4 border-t">
                                    <h4 className="font-semibold text-foreground mb-2">Formula Steps:</h4>
                                    <ol className="list-decimal list-inside space-y-1 font-mono text-xs">
                                        <li>Rearrange to: ({result.finalA})x² + ({result.finalB})x + ({result.finalC}) = 0</li>
                                        <li>Use formula: x = [-b ± √(b² - 4ac)] / 2a</li>
                                        <li>Plug in values: x = [-({result.finalB}) ± √(({result.finalB})² - 4 * {result.finalA} * {result.finalC})] / (2 * {result.finalA})</li>
                                        <li>Simplify: x = [-{result.finalB} ± √({result.discriminant})] / {2 * result.finalA}</li>
                                    </ol>
                                </div>
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
                        This calculator finds the roots of a quadratic equation. It first rearranges the terms you provide into the standard form `ax² + bx + c = 0` and then solves for 'x'.
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
