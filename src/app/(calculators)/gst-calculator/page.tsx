
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
  amount: z.coerce.number().min(0.01, 'Amount must be greater than zero.'),
  gstRate: z.coerce.number().min(0, 'GST rate must be a positive number.'),
  calculationType: z.enum(['add', 'remove']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  baseAmount: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
};

const gstRates = [3, 5, 12, 18, 28];

export default function GstCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      gstRate: 18,
      calculationType: 'add',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const calculationType = watch('calculationType');
  const gstRate = watch('gstRate');

  const onSubmit = (data: FormValues) => {
    let baseAmount: number, gstAmount: number, totalAmount: number;

    if (data.calculationType === 'add') {
      baseAmount = data.amount;
      gstAmount = baseAmount * (data.gstRate / 100);
      totalAmount = baseAmount + gstAmount;
    } else { // remove
      totalAmount = data.amount;
      baseAmount = totalAmount / (1 + data.gstRate / 100);
      gstAmount = totalAmount - baseAmount;
    }
    
    setResult({
      baseAmount,
      gstAmount,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      totalAmount,
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
                <CardTitle className="font-headline text-2xl">GST Calculator</CardTitle>
                <CardDescription>Easily add or remove Goods and Services Tax from any amount.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" type="number" step="0.01" {...register('amount')} />
                    {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
                  </div>

                  <RadioGroup
                    defaultValue="add"
                    className="grid grid-cols-2 gap-4"
                    value={calculationType}
                    onValueChange={(value) => setValue('calculationType', value as 'add' | 'remove')}
                  >
                    <div>
                      <RadioGroupItem value="add" id="add" className="peer sr-only" />
                      <Label htmlFor="add" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Add GST</Label>
                    </div>
                    <div>
                      <RadioGroupItem value="remove" id="remove" className="peer sr-only" />
                      <Label htmlFor="remove" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Remove GST</Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label>GST Rate (%)</Label>
                    <div className="flex flex-wrap gap-2">
                        {gstRates.map(rate => (
                           <Button
                                key={rate}
                                type="button"
                                variant={gstRate === rate ? "default" : "outline"}
                                onClick={() => setValue('gstRate', rate)}
                           >
                               {rate}%
                           </Button>
                        ))}
                         <Input 
                            type="number" 
                            step="0.1" 
                            placeholder="Custom"
                            className="w-24"
                            {...register('gstRate')}
                          />
                    </div>
                     {errors.gstRate && <p className="text-destructive text-sm">{errors.gstRate.message}</p>}
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
                  <CardTitle className="font-headline">GST Calculation Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <span className='font-bold'>Total Amount (inc. GST):</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(result.totalAmount)}</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                       <div className="flex justify-between">
                          <span>Base Amount:</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.baseAmount)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Total GST ({gstRate}%):</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.gstAmount)}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                          <span>CGST ({gstRate/2}%):</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.cgst)}</span>
                      </div>
                      <div className="flex justify-between pl-4">
                          <span>SGST ({gstRate/2}%):</span>
                          <span className="font-medium text-foreground">{formatCurrency(result.sgst)}</span>
                      </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`With ${gstRate}% GST, the total amount is ${formatCurrency(result.totalAmount)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding GST</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
               The Goods and Services Tax (GST) is an indirect tax used in India on the supply of goods and services. It is a comprehensive, multistage, destination-based tax that has replaced many indirect taxes in India.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">How It Works</h3>
                  <p>This calculator allows you to find the final price including GST (by adding it to a base amount) or to find the base price and GST amount from a total price (by removing it).</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What are CGST and SGST?</AccordionTrigger>
                      <AccordionContent>
                       For intra-state transactions, both Central GST (CGST) and State GST (SGST) are applied. The total GST rate is split equally between the two. For inter-state transactions, only IGST (Integrated GST) is applied, which is equal to the total GST rate.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>What are the GST slabs?</AccordionTrigger>
                      <AccordionContent>
                       GST is levied at multiple rates ranging from 0% to 28%. Common slabs are 5%, 12%, 18%, and 28%. Some essential goods and services are exempt from GST.
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
