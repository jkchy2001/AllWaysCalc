
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
  currentGrade: z.coerce.number().min(0, "Current grade must be positive.").max(100, "Grade cannot exceed 100."),
  desiredGrade: z.coerce.number().min(0, "Desired grade must be positive.").max(100, "Grade cannot exceed 100."),
  examWeight: z.coerce.number().min(1, "Exam weight must be greater than 0.").max(100, "Exam weight cannot exceed 100."),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  neededGrade: number;
};

export default function ExamMarksNeededCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentGrade: undefined,
      desiredGrade: undefined,
      examWeight: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { currentGrade, desiredGrade, examWeight } = data;
    const requiredGrade = (100 * desiredGrade - currentGrade * (100 - examWeight)) / examWeight;
    setResult({
      neededGrade: parseFloat(requiredGrade.toFixed(2)),
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
                            <CardTitle className="font-headline text-2xl">Exam Marks Needed Calculator</CardTitle>
                            <CardDescription>Find out what you need to score on your final exam.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentGrade">Your Current Grade (%)</Label>
                                    <p className="text-xs text-muted-foreground">The grade you have for the course so far, before the final exam.</p>
                                    <Input id="currentGrade" type="number" step="0.01" placeholder="e.g., 85" {...register('currentGrade')} />
                                    {errors.currentGrade && <p className="text-destructive text-sm">{errors.currentGrade.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="desiredGrade">Desired Final Grade (%)</Label>
                                    <p className="text-xs text-muted-foreground">The overall grade you want to achieve in the course.</p>
                                    <Input id="desiredGrade" type="number" step="0.01" placeholder="e.g., 90" {...register('desiredGrade')} />
                                    {errors.desiredGrade && <p className="text-destructive text-sm">{errors.desiredGrade.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="examWeight">Weight of the Final Exam (%)</Label>
                                    <p className="text-xs text-muted-foreground">How much the final exam is worth as a percentage of your total grade.</p>
                                    <Input id="examWeight" type="number" step="0.01" placeholder="e.g., 25" {...register('examWeight')} />
                                    {errors.examWeight && <p className="text-destructive text-sm">{errors.examWeight.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">You Need to Score...</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className={`text-6xl font-bold ${result.neededGrade > 100 ? 'text-destructive' : 'text-primary'}`}>
                                    {result.neededGrade}%
                                </div>
                                <div className="text-lg text-muted-foreground">
                                   ...on your final exam to get your desired grade.
                                </div>
                                {result.neededGrade > 100 && <p className="text-destructive font-semibold">It might be tough, but don't give up!</p>}
                                {result.neededGrade < 0 && <p className="text-green-600 font-semibold">You've already achieved your desired grade!</p>}
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`I need to score ${result.neededGrade}% on my final exam!`} />
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
                        This calculator helps you determine the grade you need on a final exam to achieve a specific overall grade in a course. It's a useful tool for planning your study strategy.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              Required Grade = (100 × Desired Grade - Current Grade × (100 - Exam Weight)) / Exam Weight
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What does "Exam Weight" mean?</AccordionTrigger>
                              <AccordionContent>
                              The exam weight is the percentage of your total grade that the final exam is worth. For example, if your final exam is worth 25% of your grade, you would enter 25.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What if the result is over 100% or below 0%?</AccordionTrigger>
                              <AccordionContent>
                              If the required grade is over 100%, it means your desired grade is mathematically impossible to achieve. If it's below 0%, it means you have already surpassed your desired grade, even if you get a 0 on the final.
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
                        <Link href="/gpa-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">GPA Calculator</p>
                        </Link>
                        <Link href="/assignment-weight-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Assignment Weight</p>
                        </Link>
                        <Link href="/semester-grade-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Semester Grade</p>
                        </Link>
                        <Link href="/attendance-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <p className="font-semibold">Attendance Calculator</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
