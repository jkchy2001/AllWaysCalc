
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
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home, Sparkles } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { solveAlgebra } from '@/ai/flows/algebra-flow';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  problem: z.string().min(1, 'Please enter a math problem.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    solution: string;
};

export default function AiMathSolverPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problem: 'Solve for x: 2x + 10 = 40',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await solveAlgebra({ problem: data.problem });
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult({ solution: 'Sorry, I encountered an error while solving this problem.' });
    } finally {
      setIsLoading(false);
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
                            <CardTitle className="font-headline text-2xl">Algebra Calculator</CardTitle>
                            <CardDescription>Get step-by-step solutions for your algebra problems using AI.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="problem">Enter your algebra problem</Label>
                                    <Textarea
                                        id="problem"
                                        rows={4}
                                        placeholder="e.g., Simplify (x-2)(x+5) or Find the roots of x^2 - 5x + 6"
                                        {...register('problem')}
                                    />
                                    {errors.problem && <p className="text-destructive text-sm">{errors.problem.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
                                    {isLoading ? 'Solving...' : 'Solve Problem'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {(isLoading || result) && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <Sparkles className="size-5" /> AI Generated Solution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading && (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                )}
                                {result && (
                                   <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                                      {result.solution}
                                   </div>
                                )}
                            </CardContent>
                             <CardFooter>
                                {result && <SharePanel resultText={`I solved an algebra problem using AI! Problem: ${form.getValues('problem')}. Solution: ${result.solution}`} />}
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
                        This tool uses a powerful generative AI model to understand and solve a wide range of algebra problems. Simply type in your question, and the AI will provide a detailed, step-by-step solution.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Example Problems</h3>
                           <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                <li>Solve for x: 3x - 7 = 14</li>
                                <li>Factor the polynomial: x² - 4x - 5</li>
                                <li>Simplify the expression: 4(a + 2b) - 2(a - b)</li>
                           </ul>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is the solution always correct?</AccordionTrigger>
                              <AccordionContent>
                                While AI is incredibly powerful, it can sometimes make mistakes. Always double-check the provided solution, especially for critical applications. Use it as a learning tool to understand the steps involved.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What kind of math can it solve?</AccordionTrigger>
                              <AccordionContent>
                                The AI can handle a wide variety of topics including pre-algebra, algebra, and more. Feel free to experiment with different types of problems!
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
