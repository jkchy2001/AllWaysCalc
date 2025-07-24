
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
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  basicSalary: z.coerce.number().min(0, 'Basic salary must be a positive number.'),
  da: z.coerce.number().min(0, 'DA must be a positive number.'),
  hraReceived: z.coerce.number().min(0, 'HRA received must be a positive number.'),
  rentPaid: z.coerce.number().min(0, 'Rent paid must be a positive number.'),
  isMetro: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  exemptedHra: number;
  taxableHra: number;
  hraReceived: number;
};

export default function HraCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basicSalary: undefined,
      da: 0,
      hraReceived: undefined,
      rentPaid: undefined,
      isMetro: false,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { basicSalary, da, hraReceived, rentPaid, isMetro } = data;
    
    const salaryForHra = basicSalary + da;
    
    // 1. Actual HRA received
    const condition1 = hraReceived;
    
    // 2. Rent paid minus 10% of salary
    const condition2 = rentPaid - (0.10 * salaryForHra);
    
    // 3. 50% of salary for metro, 40% for non-metro
    const condition3 = isMetro ? (0.50 * salaryForHra) : (0.40 * salaryForHra);

    const exemptedHra = Math.max(0, Math.min(condition1, condition2, condition3));
    const taxableHra = hraReceived - exemptedHra;
    
    setResult({
      exemptedHra,
      taxableHra,
      hraReceived,
    });
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
                <CardTitle className="font-headline text-2xl">HRA Exemption Calculator</CardTitle>
                <CardDescription>Calculate your tax exemption on House Rent Allowance.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">Annual Basic Salary (₹)</Label>
                    <Input id="basicSalary" type="number" step="0.01" {...register('basicSalary')} />
                    {errors.basicSalary && <p className="text-destructive text-sm">{errors.basicSalary.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="da">Annual Dearness Allowance (DA) (₹)</Label>
                    <Input id="da" type="number" step="0.01" {...register('da')} />
                     {errors.da && <p className="text-destructive text-sm">{errors.da.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hraReceived">Annual HRA Received (₹)</Label>
                    <Input id="hraReceived" type="number" step="0.01" {...register('hraReceived')} />
                    {errors.hraReceived && <p className="text-destructive text-sm">{errors.hraReceived.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="rentPaid">Annual Rent Paid (₹)</Label>
                    <Input id="rentPaid" type="number" step="0.01" {...register('rentPaid')} />
                    {errors.rentPaid && <p className="text-destructive text-sm">{errors.rentPaid.message}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isMetro" {...register('isMetro')} />
                    <Label htmlFor="isMetro">I live in a metro city (Delhi, Mumbai, Kolkata, Chennai).</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate HRA Exemption</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">HRA Calculation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <span className='font-bold'>Exempted HRA:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(result.exemptedHra)}</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                       <div className="flex justify-between">
                          <span>Total HRA Received:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.hraReceived)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Taxable HRA:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.taxableHra)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My exempt HRA is ${formatCurrency(result.exemptedHra)} and taxable HRA is ${formatCurrency(result.taxableHra)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding HRA Exemption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               House Rent Allowance (HRA) is a common component of a salary package. You can claim tax exemption on the HRA you receive, subject to certain conditions under the Income Tax Act. This calculator helps you figure out that exemption amount.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Exemption Calculation</h3>
                   <p>The amount of HRA exemption is the <b>minimum</b> of the following three:</p>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Actual HRA received from the employer.</li>
                    <li>Actual rent paid minus 10% of (Basic Salary + DA).</li>
                    <li>50% of (Basic Salary + DA) for those living in metro cities, or 40% for non-metro cities.</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What documents are needed to claim HRA?</AccordionTrigger>
                      <AccordionContent>
                       You need rent receipts to claim HRA exemption. If the annual rent exceeds ₹1,00,000, you must also provide the landlord's PAN.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Can I claim HRA if I live in my own house?</AccordionTrigger>
                      <AccordionContent>
                       No, you cannot claim HRA exemption if you live in your own house. You must be paying rent for a residential accommodation to be eligible.
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
