
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
  cgpa: z.coerce.number().min(0, "CGPA must be a positive number.").max(10, "CGPA cannot be greater than 10."),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    percentage: number;
};

export default function CgpaToPercentageCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cgpa: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const percentage = data.cgpa * 9.5;
    setResult({
        percentage: parseFloat(percentage.toFixed(2)),
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
                            <CardTitle className="font-headline text-2xl">CGPA to Percentage Converter</CardTitle>
                            <CardDescription>Convert your CGPA to an equivalent percentage.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cgpa">Your CGPA (out of 10)</Label>
                                    <Input id="cgpa" type="number" step="0.01" placeholder="e.g., 8.5" {...register('cgpa')} />
                                    {errors.cgpa && <p className="text-destructive text-sm">{errors.cgpa.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Convert</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Converted Percentage</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.percentage}%</div>
                                <div className="text-lg text-muted-foreground">
                                   Your equivalent percentage is {result.percentage}%.
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My CGPA converts to ${result.percentage}%!`} />
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
                        This calculator converts a Cumulative Grade Point Average (CGPA) on a 10-point scale to an equivalent percentage. This is a common conversion required for various applications for jobs and higher education.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <p>The conversion is based on the directive provided by many Indian universities and boards:</p>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              Percentage = CGPA × 9.5
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this formula universally applicable?</AccordionTrigger>
                              <AccordionContent>
                              While this formula is widely used, some universities or institutions may have their own specific conversion formulas. It's always best to check with the concerned institution for their official conversion method.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Why is 9.5 used as the multiplier?</AccordionTrigger>
                              <AccordionContent>
                              The multiplier of 9.5 is an approximation derived by analyzing the results of previous years' examinations and finding the average marks of candidates across different subjects.
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
