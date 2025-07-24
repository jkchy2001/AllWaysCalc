
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
import { Home, Activity } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  outputPower: z.coerce.number().min(1, 'Output power must be positive.'),
  copperLosses: z.coerce.number().min(0, 'Copper losses must be a positive number.'),
  ironLosses: z.coerce.number().min(0, 'Iron losses must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  efficiency: number;
  totalLosses: number;
  inputPower: number;
};

export default function TransformerEfficiencyCalculatorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outputPower: 10000, // 10kW
      copperLosses: 300,
      ironLosses: 150,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { outputPower, copperLosses, ironLosses } = data;

    const totalLosses = copperLosses + ironLosses;
    const inputPower = outputPower + totalLosses;
    
    if (inputPower === 0) {
      setResult({ efficiency: 0, totalLosses, inputPower });
      return;
    }

    const efficiency = (outputPower / inputPower) * 100;

    setResult({
      efficiency,
      totalLosses,
      inputPower,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Online Transformer Efficiency Calculator</CardTitle>
                <CardDescription>Calculate the efficiency of an electrical transformer based on its output power and losses.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="outputPower">Output Power (Watts)</Label>
                    <p className="text-xs text-muted-foreground">The power delivered to the load.</p>
                    <Input id="outputPower" type="number" {...register('outputPower')} />
                    {errors.outputPower && <p className="text-destructive text-sm">{errors.outputPower.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copperLosses">Copper Losses (I²R Losses) (Watts)</Label>
                     <p className="text-xs text-muted-foreground">Losses in the windings, which vary with the load.</p>
                    <Input id="copperLosses" type="number" {...register('copperLosses')} />
                    {errors.copperLosses && <p className="text-destructive text-sm">{errors.copperLosses.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="ironLosses">Iron Losses (Core Losses) (Watts)</Label>
                    <p className="text-xs text-muted-foreground">Constant losses in the core, regardless of load.</p>
                    <Input id="ironLosses" type="number" {...register('ironLosses')} />
                    {errors.ironLosses && <p className="text-destructive text-sm">{errors.ironLosses.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate Efficiency</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Efficiency Result</CardTitle>
                  <CardDescription>Based on your inputs, here is the calculated efficiency.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center border-b pb-4">
                        <p className="text-sm text-muted-foreground">Transformer Efficiency</p>
                        <p className="text-4xl font-bold text-primary">{result.efficiency.toFixed(2)}%</p>
                    </div>
                     <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Input Power</TableCell>
                                <TableCell className="text-right font-medium">{(result.inputPower / 1000).toFixed(2)} kW</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Total Losses</TableCell>
                                <TableCell className="text-right font-medium">{result.totalLosses.toFixed(2)} W</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The transformer efficiency is ${result.efficiency.toFixed(2)}%.`} />
                </CardFooter>
              </Card>
            )}
          </div>
           <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Transformer Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Transformer efficiency is the ratio of the output power to the input power. An ideal transformer would be 100% efficient, but in reality, all transformers have losses that reduce efficiency.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What are Copper and Iron Losses?</AccordionTrigger>
                  <AccordionContent>
                   <p><b>Copper Losses (I²R Losses):</b> These are due to the electrical resistance of the copper windings. They vary with the load on the transformer.</p>
                   <p className="mt-2"><b>Iron Losses (Core Losses):</b> These are caused by the alternating magnetic field in the transformer core and consist of hysteresis and eddy current losses. They are constant and occur whenever the transformer is energized, regardless of the load.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How is efficiency calculated?</AccordionTrigger>
                  <AccordionContent>
                   The efficiency is calculated using the formula:
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Efficiency (%) = (Output Power / Input Power) * 100
                    </code>
                  </pre>
                  Where Input Power = Output Power + Copper Losses + Iron Losses.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Why is high efficiency important?</AccordionTrigger>
                    <AccordionContent>
                    High efficiency is crucial for minimizing energy waste, reducing operating costs, and lowering the environmental impact. In large-scale power distribution, even a small improvement in efficiency can lead to significant energy and cost savings.
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
                <Link href="/ohms-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Ohm's Law</p>
                </Link>
                <Link href="/voltage-drop-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Voltage Drop</p>
                </Link>
                <Link href="/electrical-load-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Electrical Load</p>
                </Link>
                <Link href="/battery-backup-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Battery Backup</p>
                </Link>
              </CardContent>
            </Card>

        </div>
      </main>
    </div>
  );
}
