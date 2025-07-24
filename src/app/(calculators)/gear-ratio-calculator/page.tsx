
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
import { Home, Cog } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  drivingTeeth: z.coerce.number().int().min(1, 'Teeth must be at least 1.'),
  drivenTeeth: z.coerce.number().int().min(1, 'Teeth must be at least 1.'),
  inputRpm: z.coerce.number().optional(),
  inputTorque: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  gearRatio: number;
  outputRpm?: number;
  outputTorque?: number;
};

export default function GearRatioCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drivingTeeth: 12,
      drivenTeeth: 36,
      inputRpm: 1000,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const gearRatio = data.drivenTeeth / data.drivingTeeth;
    let outputRpm: number | undefined;
    let outputTorque: number | undefined;

    if (data.inputRpm) {
      outputRpm = data.inputRpm / gearRatio;
    }
    if (data.inputTorque) {
      outputTorque = data.inputTorque * gearRatio;
    }

    setResult({
      gearRatio,
      outputRpm,
      outputTorque,
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
                <CardTitle className="font-headline text-2xl">Gear Ratio Calculator</CardTitle>
                <CardDescription>Calculate gear ratio, output RPM, and torque.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drivingTeeth">Driving Gear Teeth</Label>
                      <Input id="drivingTeeth" type="number" {...register('drivingTeeth')} />
                      {errors.drivingTeeth && <p className="text-destructive text-sm">{errors.drivingTeeth.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drivenTeeth">Driven Gear Teeth</Label>
                      <Input id="drivenTeeth" type="number" {...register('drivenTeeth')} />
                      {errors.drivenTeeth && <p className="text-destructive text-sm">{errors.drivenTeeth.message}</p>}
                    </div>
                  </div>
                  <div className="p-4 border rounded-md space-y-4">
                    <h3 className="font-semibold text-sm">Optional Inputs</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="inputRpm">Input Speed (RPM)</Label>
                          <Input id="inputRpm" type="number" {...register('inputRpm')} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inputTorque">Input Torque (Nm)</Label>
                          <Input id="inputTorque" type="number" {...register('inputTorque')} />
                        </div>
                    </div>
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
                  <CardTitle className="font-headline">Calculation Result</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center border-b pb-4 mb-4">
                        <p className="text-sm text-muted-foreground">Gear Ratio</p>
                        <p className="text-3xl font-bold text-primary">{result.gearRatio.toFixed(2)} : 1</p>
                    </div>
                    <Table>
                        <TableBody>
                            {result.outputRpm !== undefined && (
                                <TableRow>
                                    <TableCell>Output Speed</TableCell>
                                    <TableCell className="text-right font-medium">{result.outputRpm.toFixed(2)} RPM</TableCell>
                                </TableRow>
                            )}
                            {result.outputTorque !== undefined && (
                                <TableRow>
                                    <TableCell>Output Torque</TableCell>
                                    <TableCell className="text-right font-medium">{result.outputTorque.toFixed(2)} Nm</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`A gear ratio of ${result.gearRatio.toFixed(2)}:1.`} />
                </CardFooter>
              </Card>
            )}
          </div>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Related Calculators</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/torque-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                        <p className="font-semibold">Torque Calculator</p>
                    </Link>
                    <Link href="/newtons-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                        <p className="font-semibold">Newton's Second Law</p>
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
