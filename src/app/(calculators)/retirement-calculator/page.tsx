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
  currentAge: z.coerce.number().int().min(1, 'Current age must be positive.'),
  retirementAge: z.coerce.number().int().min(1, 'Retirement age must be positive.'),
  currentSavings: z.coerce.number().min(0, 'Savings must be a positive number.'),
  monthlyContribution: z.coerce.number().min(0, 'Contribution must be a positive number.'),
  interestRate: z.coerce.number().min(0, 'Rate must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  retirementNestEgg: number;
};

export default function RetirementCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 500,
      interestRate: 7,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { currentAge, retirementAge, currentSavings, monthlyContribution, interestRate } = data;
    const yearsToGrow = retirementAge - currentAge;
    const monthlyRate = interestRate / 100 / 12;
    const monthsToGrow = yearsToGrow * 12;

    // Future value of current savings
    const fvOfCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, monthsToGrow);

    // Future value of monthly contributions (annuity)
    const fvOfContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToGrow) - 1) / monthlyRate);

    const retirementNestEgg = fvOfCurrentSavings + fvOfContributions;

    setResult({ retirementNestEgg });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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
                <CardTitle className="font-headline text-2xl">Retirement Calculator</CardTitle>
                <CardDescription>Estimate your retirement savings.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentAge">Current Age</Label>
                      <Input id="currentAge" type="number" {...register('currentAge')} />
                      {errors.currentAge && <p className="text-destructive text-sm">{errors.currentAge.message}</p>}
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="retirementAge">Retirement Age</Label>
                      <Input id="retirementAge" type="number" {...register('retirementAge')} />
                      {errors.retirementAge && <p className="text-destructive text-sm">{errors.retirementAge.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentSavings">Current Savings ($)</Label>
                    <Input id="currentSavings" type="number" step="0.01" {...register('currentSavings')} />
                    {errors.currentSavings && <p className="text-destructive text-sm">{errors.currentSavings.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="monthlyContribution">Monthly Contribution ($)</Label>
                    <Input id="monthlyContribution" type="number" step="0.01" {...register('monthlyContribution')} />
                    {errors.monthlyContribution && <p className="text-destructive text-sm">{errors.monthlyContribution.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="interestRate">Estimated Annual Interest Rate (%)</Label>
                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
                    {errors.interestRate && <p className="text-destructive text-sm">{errors.interestRate.message}</p>}
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
                  <CardTitle className="font-headline">Your Estimated Nest Egg</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="text-4xl font-bold text-primary">{formatCurrency(result.retirementNestEgg)}</div>
                    <p className="text-muted-foreground">This is how much you could have saved for retirement.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I could have ${formatCurrency(result.retirementNestEgg)} for retirement!`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Your Retirement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               This calculator provides a simple projection of your retirement savings based on your inputs. It uses compound interest to estimate how your current savings and future contributions will grow over time.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Disclaimer</h3>
                  <p>This is a simplified model and does not account for taxes, inflation, or changes in investment strategy. It should be used for informational purposes only. Consult a financial advisor for personalized retirement planning.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is a good retirement savings goal?</AccordionTrigger>
                      <AccordionContent>
                       Many experts suggest aiming for a nest egg that is 10 to 12 times your final salary. Another common guideline is the 4% rule, which suggests you can safely withdraw 4% of your savings each year in retirement.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Why is the estimated interest rate important?</AccordionTrigger>
                      <AccordionContent>
                       The interest rate (or rate of return) has a massive impact on your savings due to compounding. Even small differences in the rate can lead to large differences in your final nest egg over several decades.
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
