
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
  originalPrice: z.coerce.number().min(0, "Original price must be positive"),
  discount: z.coerce.number().min(0, "Discount must be positive").max(100, "Discount cannot exceed 100%"),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    finalPrice: number;
    savedAmount: number;
};

export default function DiscountCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalPrice: undefined,
      discount: 10,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const savedAmount = data.originalPrice * (data.discount / 100);
    const finalPrice = data.originalPrice - savedAmount;
    setResult({
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        savedAmount: parseFloat(savedAmount.toFixed(2)),
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
                            <CardTitle className="font-headline text-2xl">Discount Calculator</CardTitle>
                            <CardDescription>Calculate the final price after a discount.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                                    <Input id="originalPrice" type="number" step="0.01" placeholder="e.g., 999" {...register('originalPrice')} />
                                    {errors.originalPrice && <p className="text-destructive text-sm">{errors.originalPrice.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount">Discount (%)</Label>
                                    <Input id="discount" type="number" step="0.01" placeholder="e.g., 25" {...register('discount')} />
                                    {errors.discount && <p className="text-destructive text-sm">{errors.discount.message}</p>}
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
                                <CardTitle className="font-headline">Price Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <span className='font-bold'>Final Price:</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(result.finalPrice)}</span>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>You Save:</span>
                                        <span className="font-medium text-foreground">{formatCurrency(result.savedAmount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`With the discount, the final price is ${formatCurrency(result.finalPrice)} (I saved ${formatCurrency(result.savedAmount)}!)`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Discounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        This calculator helps you determine the final price of an item after a percentage-based discount has been applied. It's perfect for shopping and sales.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              Amount Saved = Original Price × (Discount % / 100)<br/><br/>
                              Final Price = Original Price - Amount Saved
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Can I use this for multiple discounts?</AccordionTrigger>
                              <AccordionContent>
                               This calculator is for a single discount. For multiple discounts (e.g., 20% off, then another 10% off), you would apply them sequentially. Calculate the first discount, then use the new price to calculate the second.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>Does this include sales tax?</AccordionTrigger>
                              <AccordionContent>
                              No, this calculator only handles the discount. Sales tax would typically be calculated on the final, discounted price.
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
