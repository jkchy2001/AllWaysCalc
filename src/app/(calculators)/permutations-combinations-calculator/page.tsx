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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  n: z.coerce.number().int().min(0, "Total items must be non-negative."),
  r: z.coerce.number().int().min(0, "Items to choose must be non-negative."),
  calcType: z.enum(['permutation', 'combination']),
}).refine(data => data.r <= data.n, {
  message: "Items to choose (r) cannot be greater than total items (n).",
  path: ["r"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    result: number;
    calcType: 'permutation' | 'combination';
};

// Memoized factorial function for performance
const factorial = (() => {
    const cache: { [key: number]: number } = {};
    return (n: number): number => {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        if (cache[n]) return cache[n];
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
            cache[i] = result;
        }
        return result;
    };
})();


export default function PermutationsCombinationsCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      n: 10,
      r: 3,
      calcType: 'combination'
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    try {
        let calcResult: number;
        if (data.calcType === 'permutation') {
            calcResult = factorial(data.n) / factorial(data.n - data.r);
        } else { // combination
            calcResult = factorial(data.n) / (factorial(data.r) * factorial(data.n - data.r));
        }
        setResult({
            result: calcResult,
            calcType: data.calcType
        });
    } catch(e) {
        console.error(e);
        form.setError("root", { type: "custom", message: "Calculation resulted in an error. Please check your inputs." });
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
                            <CardTitle className="font-headline text-2xl">Permutations & Combinations Calculator</CardTitle>
                            <CardDescription>Calculate permutations (nPr) and combinations (nCr).</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    defaultValue="combination"
                                    className="grid grid-cols-2 gap-4"
                                    onValueChange={(value) => form.setValue('calcType', value as 'permutation' | 'combination')}
                                    {...register('calcType')}
                                >
                                    <div>
                                        <RadioGroupItem value="combination" id="combination" className="peer sr-only" />
                                        <Label htmlFor="combination" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Combinations (nCr)</Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="permutation" id="permutation" className="peer sr-only" />
                                        <Label htmlFor="permutation" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Permutations (nPr)</Label>
                                    </div>
                                </RadioGroup>
                                <div className="flex gap-4">
                                    <div className="space-y-2 w-1/2">
                                        <Label htmlFor="n">Total number of items (n)</Label>
                                        <Input id="n" type="number" {...register('n')} />
                                        {errors.n && <p className="text-destructive text-sm">{errors.n.message}</p>}
                                    </div>
                                    <div className="space-y-2 w-1/2">
                                        <Label htmlFor="r">Number of items to choose (r)</Label>
                                        <Input id="r" type="number" {...register('r')} />
                                        {errors.r && <p className="text-destructive text-sm">{errors.r.message}</p>}
                                    </div>
                                </div>
                                {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl font-bold text-primary">{result.result.toLocaleString()}</div>
                                <div className="text-lg text-muted-foreground">
                                   Possible {result.calcType}s
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`There are ${result.result.toLocaleString()} possible ${result.calcType}s.`} />
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
                        This calculator helps you find the number of ways to choose or arrange a subset of items from a larger set.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formulas Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              Combinations (nCr) = n! / (r! * (n-r)!)<br/><br/>
                              Permutations (nPr) = n! / (n-r)!
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What's the difference?</AccordionTrigger>
                              <AccordionContent>
                                <b>Combinations</b>: The order of selection does not matter. Think of picking a team of 3 people from a group of 10. The team {`{Alice, Bob, Charlie}`} is the same as {`{Charlie, Alice, Bob}`}.<br/><br/>
                                <b>Permutations</b>: The order of selection does matter. Think of arranging 3 people in 1st, 2nd, and 3rd place. The arrangement "Alice, Bob, Charlie" is different from "Charlie, Alice, Bob".
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
