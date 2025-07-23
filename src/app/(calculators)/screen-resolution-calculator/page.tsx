
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
import { Home, SquareTerminal } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  width: z.coerce.number().int().min(1, 'Width must be positive.'),
  height: z.coerce.number().int().min(1, 'Height must be positive.'),
  diagonal: z.coerce.number().min(0.1, 'Diagonal size must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    ppi: number;
};

export default function ScreenResolutionCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      width: 1920,
      height: 1080,
      diagonal: 24,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { width, height, diagonal } = data;
    const diagonalPixels = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    const ppi = diagonalPixels / diagonal;
    setResult({
        ppi,
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
                            <CardTitle className="font-headline text-2xl">Screen Resolution (PPI) Calculator</CardTitle>
                            <CardDescription>Calculate the pixel density of a screen.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="p-4 border rounded-md space-y-4">
                                    <h3 className="font-semibold">Screen Specs</h3>
                                    <div className="flex gap-4">
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="width">Width (pixels)</Label>
                                            <Input id="width" type="number" {...register('width')} />
                                        </div>
                                        <div className="space-y-2 w-1/2">
                                            <Label htmlFor="height">Height (pixels)</Label>
                                            <Input id="height" type="number" {...register('height')} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="diagonal">Diagonal Size (inches)</Label>
                                        <Input id="diagonal" type="number" step="0.1" {...register('diagonal')} />
                                    </div>
                                </div>
                                {errors.width && <p className="text-destructive text-sm">{errors.width.message}</p>}
                                {errors.height && <p className="text-destructive text-sm">{errors.height.message}</p>}
                                {errors.diagonal && <p className="text-destructive text-sm">{errors.diagonal.message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate PPI</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <SquareTerminal className="mx-auto size-12 text-primary" />
                                <p className="text-muted-foreground">The pixel density of the screen is:</p>
                                <div className="text-6xl font-bold text-primary">{result.ppi.toFixed(0)}</div>
                                <p className="text-lg text-muted-foreground">Pixels Per Inch (PPI)</p>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`A ${form.getValues('width')}x${form.getValues('height')} screen at ${form.getValues('diagonal')}" has a density of ${result.ppi.toFixed(0)} PPI.`} />
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
                        This calculator determines the pixel density of a screen, measured in Pixels Per Inch (PPI). A higher PPI value generally results in a sharper, clearer image.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                            <li>First, the diagonal resolution in pixels is found using the Pythagorean theorem: <br/><code className="font-code">d_p = √(w_p² + h_p²)</code></li>
                            <li>Then, the pixel density is calculated by dividing the diagonal resolution by the diagonal size of the screen: <br/><code className="font-code">PPI = d_p / d_i</code></li>
                          </ol>
                          <p className="mt-2 text-sm">Where <code className="font-code">w_p</code> is width in pixels, <code className="font-code">h_p</code> is height in pixels, and <code className="font-code">d_i</code> is the diagonal size in inches.</p>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What is a good PPI?</AccordionTrigger>
                              <AccordionContent>
                                "Good" is subjective and depends on viewing distance. For smartphones, over 300 PPI is common ("Retina"). For desktop monitors, 110-140 PPI is often considered sharp. For TVs viewed from a distance, the PPI can be much lower.
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
