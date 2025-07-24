
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Home, TrendingDown } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  material: z.enum(['copper', 'aluminum']),
  voltage: z.coerce.number().min(1, 'Voltage must be positive.'),
  current: z.coerce.number().min(0.01, 'Current must be positive.'),
  wireLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  wireArea: z.coerce.number().min(0.01, 'Area must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  voltageDrop: number;
  voltageAtEnd: number;
  dropPercentage: number;
};

// Resistivity (ρ) in Ω·m at 20°C
const RESISTIVITY = {
  copper: 1.68e-8,
  aluminum: 2.82e-8,
};

export default function VoltageDropCalculatorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      material: 'copper',
      voltage: 230,
      current: 10,
      wireLength: 50,
      wireArea: 2.5, // mm^2
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { material, voltage, current, wireLength, wireArea } = data;
    
    // Convert area from mm^2 to m^2
    const areaInM2 = wireArea / 1_000_000;
    
    const resistivity = RESISTIVITY[material as keyof typeof RESISTIVITY];

    // Formula: VD = 2 * L * ρ * I / A  (2 for two-way length)
    const voltageDrop = (2 * wireLength * resistivity * current) / areaInM2;
    const voltageAtEnd = voltage - voltageDrop;
    const dropPercentage = (voltageDrop / voltage) * 100;

    setResult({
      voltageDrop,
      voltageAtEnd,
      dropPercentage,
    });
  };
  
  const formatValue = (value: number, unit: string) => {
      return `${value.toFixed(2)} ${unit}`;
  }

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
                <CardTitle className="font-headline text-2xl">Online Voltage Drop Calculator</CardTitle>
                <CardDescription>Estimate the voltage loss across a length of copper or aluminum wire for safe electrical installations.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Wire Material</Label>
                      <Controller
                        name="material"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="copper">Copper</SelectItem>
                              <SelectItem value="aluminum">Aluminum</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voltage">System Voltage (V)</Label>
                      <Input id="voltage" type="number" {...register('voltage')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="current">Current (Amps)</Label>
                      <Input id="current" type="number" {...register('current')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wireLength">One-Way Wire Length (m)</Label>
                      <Input id="wireLength" type="number" {...register('wireLength')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wireArea">Wire Cross-Sectional Area (mm²)</Label>
                    <Input id="wireArea" type="number" step="0.1" {...register('wireArea')} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate Voltage Drop</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-headline">Calculation Result</CardTitle>
                   <CardDescription>Results of the voltage drop calculation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Voltage Drop</TableCell>
                                <TableCell className={`text-right text-lg font-bold ${result.dropPercentage > 5 ? 'text-destructive' : 'text-primary'}`}>{formatValue(result.voltageDrop, 'V')}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Voltage at End</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{formatValue(result.voltageAtEnd, 'V')}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Drop Percentage</TableCell>
                                <TableCell className={`text-right text-lg font-bold ${result.dropPercentage > 5 ? 'text-destructive' : 'text-primary'}`}>{formatValue(result.dropPercentage, '%')}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated voltage drop is ${result.voltageDrop.toFixed(2)}V (${result.dropPercentage.toFixed(2)}%).`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Voltage Drop</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Voltage drop describes how the energy supplied by a voltage source is reduced as electric current moves through the passive elements (conductors) of an electrical circuit. It's a critical factor in designing safe and efficient electrical systems.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Why is calculating voltage drop important?</AccordionTrigger>
                  <AccordionContent>
                    Excessive voltage drop can cause lights to flicker or burn dimly, heaters to heat poorly, and motors to run hotter than normal and burn out. It's a major cause of energy waste and can pose a safety hazard. Most electrical codes recommend a voltage drop of 3-5% or less.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                  <AccordionTrigger>What factors affect voltage drop?</AccordionTrigger>
                  <AccordionContent>
                   The main factors are:
                    <ul className="list-disc list-inside mt-2 pl-4">
                      <li><b>Wire Material:</b> Copper has lower resistivity than aluminum, resulting in less voltage drop.</li>
                      <li><b>Wire Length:</b> The longer the wire, the greater the resistance and voltage drop.</li>
                      <li><b>Wire Size:</b> A thicker wire (larger cross-sectional area) has less resistance and thus less voltage drop.</li>
                      <li><b>Current:</b> Higher current flowing through the wire will result in a larger voltage drop.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Disclaimer</AccordionTrigger>
                  <AccordionContent>
                    This calculator provides a simplified estimate for educational purposes only. It is NOT a substitute for professional electrical engineering advice. Actual voltage drop can be affected by factors like temperature, AC power factor, and specific wire manufacturing tolerances. For any real-world electrical installations, you MUST consult a licensed electrician or engineer to ensure safety and compliance with local electrical codes.
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
                <Link href="/electrical-load-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Electrical Load</p>
                </Link>
                <Link href="/transformer-efficiency-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Transformer Efficiency</p>
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
