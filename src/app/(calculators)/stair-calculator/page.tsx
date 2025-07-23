
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
import { Home, TrendingUp } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  totalRise: z.coerce.number().min(0.1, 'Total rise must be positive.'),
  riserMax: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  numberOfRisers: number;
  riserHeight: number;
  numberOfTreads: number;
  treadDepth: number;
  totalRun: number;
  stairAngle: number;
};

export default function StairCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      totalRise: 275,
      riserMax: 19,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { totalRise, riserMax } = data;
    
    // Use default max riser height if not provided (based on common building codes)
    if (!riserMax) {
        riserMax = unit === 'metric' ? 19 : 7.75;
    }

    const numberOfRisers = Math.ceil(totalRise / riserMax);
    const riserHeight = totalRise / numberOfRisers;
    
    // Ideal tread depth based on formula: 2 * Riser + Tread = 60 to 65 cm (or 24 to 25 inches)
    const idealSum = unit === 'metric' ? 63 : 25;
    const treadDepth = idealSum - (2 * riserHeight);
    
    const numberOfTreads = numberOfRisers - 1;
    const totalRun = treadDepth * numberOfTreads;
    
    const stairAngle = Math.atan(totalRise / totalRun) * (180 / Math.PI);

    setResult({
      numberOfRisers,
      riserHeight,
      numberOfTreads,
      treadDepth,
      totalRun,
      stairAngle
    });
  };
  
  const formatLength = (value: number, unit: 'metric' | 'imperial') => {
      return `${value.toFixed(1)} ${unit === 'metric' ? 'cm' : 'in'}`;
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
                <CardTitle className="font-headline text-2xl">Stair Calculator</CardTitle>
                <CardDescription>Calculate the dimensions for a safe and comfortable staircase.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <RadioGroup
                        defaultValue="metric"
                        className="grid grid-cols-2 gap-4"
                        value={unit}
                        onValueChange={(value) => {
                            form.setValue('unit', value as 'metric' | 'imperial');
                            if (value === 'metric') {
                                form.setValue('totalRise', 275);
                                form.setValue('riserMax', 19);
                            } else {
                                form.setValue('totalRise', 108);
                                form.setValue('riserMax', 7.75);
                            }
                        }}
                    >
                        <div>
                            <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (cm)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (in)</Label>
                        </div>
                    </RadioGroup>

                    <div className="space-y-2">
                        <Label htmlFor="totalRise">Total Rise (Floor to Floor Height)</Label>
                        <Input id="totalRise" type="number" step="0.1" {...register('totalRise')} />
                        {errors.totalRise && <p className="text-destructive text-sm">{errors.totalRise.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="riserMax">Maximum Riser Height (Optional)</Label>
                        <Input id="riserMax" type="number" step="0.1" {...register('riserMax')} />
                        <p className="text-xs text-muted-foreground">Sets an upper limit for each step's height. Defaults to building code standards.</p>
                        {errors.riserMax && <p className="text-destructive text-sm">{errors.riserMax.message}</p>}
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Stairs</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Staircase Dimensions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Number of Risers</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.numberOfRisers}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Riser Height</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{formatLength(result.riserHeight, unit)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Number of Treads</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.numberOfTreads}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Tread Depth</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{formatLength(result.treadDepth, unit)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Total Run</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{formatLength(result.totalRun, unit)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Stair Angle</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.stairAngle.toFixed(1)}°</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My staircase will have ${result.numberOfRisers} steps with a total run of ${formatLength(result.totalRun, unit)}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Build Stairs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you find the critical dimensions needed to build a staircase. A well-designed staircase is not just functional but also safe and comfortable to use.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>The number of risers is found by dividing the total rise by a maximum comfortable riser height.</li>
                    <li>The actual riser height is then the total rise divided by the calculated number of risers.</li>
                    <li>The tread depth is calculated using a common ergonomic formula (2 x Riser Height + Tread Depth ≈ 63cm or 25in).</li>
                    <li>The total run is the tread depth multiplied by the number of treads (which is one less than the number of risers).</li>
                  </ol>
                  <p className="text-sm font-semibold mt-4 text-destructive">Disclaimer: Always check your local building codes and regulations. This calculator is for estimation purposes only and is not a substitute for professional architectural or construction advice.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
