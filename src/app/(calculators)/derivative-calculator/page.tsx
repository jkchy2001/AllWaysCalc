
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
import { Parser } from 'expr-eval';

const formSchema = z.object({
  expression: z.string().min(1, 'Please enter a function.'),
  variable: z.string().min(1, 'Please enter a variable.').default('x'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    derivative: string;
    error?: string;
};

export default function DerivativeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expression: 'x^2 + 2*x + 1',
      variable: 'x',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    try {
      const parser = new Parser();
      const derivative = parser.parse(data.expression).derivative(data.variable).toString();
      setResult({ derivative });
    } catch (e: any) {
      setResult({ derivative: '', error: e.message || "Invalid expression" });
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
                            <CardTitle className="font-headline text-2xl">Derivative Calculator</CardTitle>
                            <CardDescription>Find the derivative of a function.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expression">Function f(x)</Label>
                                    <Input id="expression" placeholder="e.g., x^3 + sin(x)" {...register('expression')} />
                                    {errors.expression && <p className="text-destructive text-sm">{errors.expression.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="variable">Differentiate with respect to</Label>
                                    <Input id="variable" placeholder="e.g., x" {...register('variable')} className="w-24" />
                                    {errors.variable && <p className="text-destructive text-sm">{errors.variable.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Differentiate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                {result.error ? (
                                    <p className="text-destructive font-semibold">{result.error}</p>
                                ) : (
                                    <>
                                        <p className="text-muted-foreground">The derivative is:</p>
                                        <div className="text-4xl font-bold text-primary font-mono bg-muted p-4 rounded-lg break-all">
                                            {result.derivative}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={result.error ? `Error calculating derivative.` : `The derivative is: ${result.derivative}`} />
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
                        This calculator finds the derivative of a mathematical function, which represents the rate of change of the function. It's a fundamental concept in calculus.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Methodology</h3>
                           <p>The calculator uses a powerful expression parser that understands the rules of differentiation, including the power rule, product rule, quotient rule, and chain rule for various functions like polynomials, trigonometric functions (sin, cos, tan), and logarithms (log, ln).</p>
                           <h4 className='font-semibold mt-4'>Examples:</h4>
                            <ul className="list-disc list-inside text-sm mt-2 space-y-1 bg-muted p-4 rounded-md">
                                <li>Power rule: `x^3` becomes `3 * x^2`</li>
                                <li>Trigonometric: `sin(x)` becomes `cos(x)`</li>
                                <li>Chain rule: `sin(2*x)` becomes `2 * cos(2 * x)`</li>
                            </ul>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What is a derivative?</AccordionTrigger>
                              <AccordionContent>
                                In simple terms, the derivative measures the steepness of the graph of a function at a certain point. It tells you the instantaneous rate of change of the function.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Why can't I solve for a specific value?</AccordionTrigger>
                              <AccordionContent>
                                This calculator performs symbolic differentiation, which means it gives you the derivative function itself. To find the value of the derivative at a specific point, you would substitute that point into the resulting expression.
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
