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
import { Home, Sparkles } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    luckyNumber: number;
};

// Calculates the digital root of a number
const getDigitalRoot = (num: number): number => {
    let sum = num;
    while (sum > 9) {
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum;
};

const getLuckyNumber = (date: Date): number => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    const dateString = `${day}${month}${year}`;
    const initialSum = dateString.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);

    return getDigitalRoot(initialSum);
}


export default function LuckyNumberCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const birthDate = new Date(data.birthDate);
    const luckyNumber = getLuckyNumber(birthDate);
    setResult({ luckyNumber });
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
                            <CardTitle className="font-headline text-2xl">Lucky Number Calculator</CardTitle>
                            <CardDescription>Find your personal lucky number from your birth date.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">Your Date of Birth</Label>
                                    <Input id="birthDate" type="date" {...register('birthDate')} />
                                    {errors.birthDate && <p className="text-destructive text-sm">{errors.birthDate.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Find My Lucky Number</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                       <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline text-center">Your Lucky Number</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <Sparkles className="mx-auto size-16 text-primary" />
                                <div className="text-6xl font-bold text-primary">{result.luckyNumber}</div>
                                <div className="text-muted-foreground">Based on your date of birth.</div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`My lucky number is ${result.luckyNumber}!`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How It Works & Disclaimer</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        This calculator uses a numerological method to find your "lucky number" from your date of birth. It repeatedly sums the digits of your birth date until a single-digit number is reached.
                      </p>
                      <p className="font-semibold text-destructive">
                        This calculator is for entertainment purposes only. The concept of a "lucky number" is not based on scientific fact and should be enjoyed as a fun novelty.
                      </p>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
