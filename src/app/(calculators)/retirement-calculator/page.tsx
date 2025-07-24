
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                <CardDescription>Estimate your retirement savings and see how your contributions can grow over time.</CardDescription>
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
                    <Label htmlFor="currentSavings">Current Savings (₹)</Label>
                    <p className="text-xs text-muted-foreground">The amount you have already saved for retirement.</p>
                    <Input id="currentSavings" type="number" step="0.01" {...register('currentSavings')} />
                    {errors.currentSavings && <p className="text-destructive text-sm">{errors.currentSavings.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="monthlyContribution">Monthly Contribution (₹)</Label>
                    <p className="text-xs text-muted-foreground">The amount you plan to save each month.</p>
                    <Input id="monthlyContribution" type="number" step="0.01" {...register('monthlyContribution')} />
                    {errors.monthlyContribution && <p className="text-destructive text-sm">{errors.monthlyContribution.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="interestRate">Estimated Annual Interest Rate (%)</Label>
                    <p className="text-xs text-muted-foreground">The average annual return you expect on your investments.</p>
                    <Input id="interestRate" type="number" step="0.01" {...register('interestRate')} />
                    {errors.interestRate && <p className="text-destructive text-sm">{errors.interestRate.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate</Button>
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
                    <p className="text-muted-foreground">This is how much you could have saved by age {form.getValues('retirementAge')}.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I could have ${formatCurrency(result.retirementNestEgg)} for retirement!`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Your Retirement Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               This calculator provides a simple projection of your retirement savings based on your inputs. It uses the power of compound interest to estimate how your current savings and future contributions will grow over time.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Key Factors in Your Calculation</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Time:</strong> The longer your money is invested, the more it can grow. Starting early is one of the biggest advantages you can have.</li>
                        <li><strong>Contributions:</strong> The amount you save regularly has a direct impact on your final corpus.</li>
                        <li><strong>Rate of Return:</strong> The interest rate or return on your investments significantly affects the growth of your savings due to compounding.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                  <AccordionTrigger>Important Disclaimers and Considerations</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Inflation:</strong> This calculator does not account for inflation, which will reduce the purchasing power of your nest egg in the future.</li>
                        <li><strong>Taxes:</strong> Investment returns may be subject to taxes, which are not factored into this calculation.</li>
                        <li><strong>Variable Returns:</strong> The interest rate is an estimate. Real-world investment returns are not guaranteed and can fluctuate.</li>
                        <li><strong>Professional Advice:</strong> This tool is for informational purposes only. Consult a financial advisor for personalized retirement planning.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">What is a good retirement savings goal?</h4>
                        <p>Many experts suggest aiming for a nest egg that is 10 to 12 times your final salary. Another common guideline is the 4% rule, which suggests you can safely withdraw 4% of your savings each year in retirement.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Why is the estimated interest rate important?</h4>
                        <p>The interest rate (or rate of return) has a massive impact on your savings due to compounding. Even small differences in the rate can lead to large differences in your final nest egg over several decades.</p>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
           <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Calculators</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/sip-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">SIP Calculator</p>
              </Link>
              <Link href="/ppf-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">PPF Calculator</p>
              </Link>
              <Link href="/inflation-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Inflation Calculator</p>
              </Link>
               <Link href="/compound-interest-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Compound Interest</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
