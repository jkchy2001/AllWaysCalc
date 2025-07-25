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
  dividend: z.coerce.number(),
  divisor: z.coerce.number().refine((val) => val !== 0, {
    message: "Divisor cannot be zero.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    remainder: number;
    dividend: number;
    divisor: number;
};

export default function ModuloCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dividend: undefined,
      divisor: undefined,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const remainder = data.dividend % data.divisor;
    setResult({
        remainder,
        dividend: data.dividend,
        divisor: data.divisor
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
                            <CardTitle className="font-headline text-2xl">Modulo Calculator</CardTitle>
                            <CardDescription>Find the remainder of a division.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dividend">Dividend</Label>
                                    <Input id="dividend" type="number" step="any" placeholder="e.g., 10" {...register('dividend')} />
                                    {errors.dividend && <p className="text-destructive text-sm">{errors.dividend.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="divisor">Divisor</Label>
                                    <Input id="divisor" type="number" step="any" placeholder="e.g., 3" {...register('divisor')} />
                                    {errors.divisor && <p className="text-destructive text-sm">{errors.divisor.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Remainder</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.remainder}</div>
                                <div className="text-lg text-muted-foreground">
                                   {result.dividend} mod {result.divisor} = {result.remainder}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`${result.dividend} mod ${result.divisor} is ${result.remainder}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding the Modulo Operation</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        The modulo operation (abbreviated as "mod") finds the remainder after division of one number by another. For example, 10 mod 3 is 1, because 10 divided by 3 leaves a remainder of 1.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              a mod n = r
                          </code>
                          </pre>
                          <p className="mt-2">Where 'a' is the dividend, 'n' is the divisor, and 'r' is the remainder.</p>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What is it used for?</AccordionTrigger>
                              <AccordionContent>
                                  The modulo operation is very common in programming and computer science. It's used for tasks like checking if a number is even or odd, wrapping around values in a cyclical way (like days of the week), and in cryptography.
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
