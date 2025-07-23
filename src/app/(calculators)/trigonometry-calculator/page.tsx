
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const formSchema = z.object({
  angle: z.coerce.number(),
  unit: z.enum(['degrees', 'radians']),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  sin: number;
  cos: number;
  tan: number;
};

export default function TrigonometryCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      angle: 45,
      unit: 'degrees',
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    let angleInRadians = data.angle;
    if (data.unit === 'degrees') {
      angleInRadians = data.angle * (Math.PI / 180);
    }

    const sin = Math.sin(angleInRadians);
    const cos = Math.cos(angleInRadians);
    let tan = Math.tan(angleInRadians);

    // Handle vertical asymptotes for tan (e.g., at 90 degrees)
    if (Math.abs(cos) < 1e-10) {
      tan = Infinity;
    }

    setResult({
      sin,
      cos,
      tan,
    });
  };
  
  const formatResult = (value: number) => {
    if (value === Infinity) return 'Undefined';
    if (Math.abs(value) < 1e-10) return '0';
    return value.toFixed(6);
  }

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
                            <CardTitle className="font-headline text-2xl">Trigonometry Calculator</CardTitle>
                            <CardDescription>Calculate Sin, Cos, and Tan for a given angle.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="angle">Angle</Label>
                                    <Input id="angle" type="number" step="any" placeholder="e.g., 45" {...register('angle')} />
                                    {errors.angle && <p className="text-destructive text-sm">{errors.angle.message}</p>}
                                </div>
                                <RadioGroup
                                    defaultValue="degrees"
                                    className="flex gap-4"
                                    onValueChange={(value) => form.setValue('unit', value as 'degrees' | 'radians')}
                                    {...register('unit')}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="degrees" id="degrees" />
                                        <Label htmlFor="degrees">Degrees</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="radians" id="radians" />
                                        <Label htmlFor="radians">Radians</Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Function</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Sine (sin)</TableCell>
                                            <TableCell className="text-right font-mono">{formatResult(result.sin)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Cosine (cos)</TableCell>
                                            <TableCell className="text-right font-mono">{formatResult(result.cos)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Tangent (tan)</TableCell>
                                            <TableCell className="text-right font-mono">{formatResult(result.tan)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`For angle ${form.getValues('angle')}°, sin=${formatResult(result.sin)}, cos=${formatResult(result.cos)}, tan=${formatResult(result.tan)}`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Trigonometry</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        Trigonometry is a branch of mathematics that studies relationships between side lengths and angles of triangles. The functions sine, cosine, and tangent are the primary trigonometric functions.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Definitions</h3>
                           <p>For a right-angled triangle, the trigonometric functions are defined as:</p>
                           <ul className="list-disc list-inside mt-2 space-y-1 bg-muted p-4 rounded-md">
                               <li><b>Sine (sin)</b> = Opposite / Hypotenuse</li>
                               <li><b>Cosine (cos)</b> = Adjacent / Hypotenuse</li>
                               <li><b>Tangent (tan)</b> = Opposite / Adjacent</li>
                           </ul>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What's the difference between Degrees and Radians?</AccordionTrigger>
                              <AccordionContent>
                                Both are units for measuring angles. A full circle is 360 degrees, which is equivalent to 2π radians. Radians are often used in higher-level mathematics because they can simplify many formulas.
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-2">
                              <AccordionTrigger>Why is Tan sometimes "Undefined"?</AccordionTrigger>
                              <AccordionContent>
                                The tangent function is calculated as sin(x) / cos(x). When cos(x) is zero (which happens at 90°, 270°, etc.), the division is undefined. This corresponds to a vertical asymptote on the graph of the tangent function.
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
