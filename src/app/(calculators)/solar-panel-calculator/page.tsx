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
import { Home, Sun } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  monthlyKwh: z.coerce.number().min(1, 'Consumption must be positive.'),
  sunlightHours: z.coerce.number().min(1, 'Sunlight hours must be positive.').max(24),
  panelWattage: z.coerce.number().int(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  panelsNeeded: number;
  systemSizeKw: number;
  roofAreaM2: number;
  roofAreaFt2: number;
};

const panelWattageOptions = [250, 300, 350, 400, 450];
const AVERAGE_PANEL_AREA_M2 = 1.7; // Average size of a residential panel
const AVERAGE_PANEL_AREA_FT2 = 18;
const SYSTEM_EFFICIENCY_FACTOR = 0.77; // Accounts for inverter, wiring, dirt, etc.

export default function SolarPanelCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyKwh: 300,
      sunlightHours: 5,
      panelWattage: 350,
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { monthlyKwh, sunlightHours, panelWattage } = data;

    const dailyKwh = monthlyKwh / 30;
    const dcSystemSize = dailyKwh / sunlightHours;
    const acSystemSize = dcSystemSize / SYSTEM_EFFICIENCY_FACTOR;
    
    const systemSizeKw = acSystemSize;
    const panelsNeeded = Math.ceil((systemSizeKw * 1000) / panelWattage);
    
    const roofAreaM2 = panelsNeeded * AVERAGE_PANEL_AREA_M2;
    const roofAreaFt2 = panelsNeeded * AVERAGE_PANEL_AREA_FT2;

    setResult({
      panelsNeeded,
      systemSizeKw,
      roofAreaM2,
      roofAreaFt2,
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
                <CardTitle className="font-headline text-2xl">Solar Panel Calculator</CardTitle>
                <CardDescription>Estimate your solar energy needs.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyKwh">Average Monthly Electricity Use (kWh)</Label>
                    <Input id="monthlyKwh" type="number" {...register('monthlyKwh')} />
                    {errors.monthlyKwh && <p className="text-destructive text-sm">{errors.monthlyKwh.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sunlightHours">Average Peak Sunlight Hours per Day</Label>
                    <Input id="sunlightHours" type="number" step="0.5" {...register('sunlightHours')} />
                    {errors.sunlightHours && <p className="text-destructive text-sm">{errors.sunlightHours.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Solar Panel Wattage</Label>
                    <Controller
                        name="panelWattage"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {panelWattageOptions.map(wattage => (
                                        <SelectItem key={wattage} value={String(wattage)}>{wattage} W</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Solar Needs</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Estimated Solar Needs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Panels Required</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.panelsNeeded}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">System Size</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.systemSizeKw.toFixed(2)} kW</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell className="font-medium">Roof Area Needed</TableCell>
                                <TableCell className="text-right text-lg font-bold text-primary">{result.roofAreaM2.toFixed(1)} m² / {result.roofAreaFt2.toFixed(1)} ft²</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I would need a ${result.systemSizeKw.toFixed(2)} kW solar system to cover my electricity needs.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Your Solar Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator provides a high-level estimate for a grid-tied solar panel system. It helps you understand the approximate number of panels, system size, and roof area required to offset your electricity consumption.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate your average daily energy consumption from your monthly usage.</li>
                    <li>Determine the required DC system size based on your daily consumption and local sunlight hours.</li>
                    <li>Adjust for system inefficiency (AC/DC conversion, wiring, dirt on panels) to find the true required AC system size. Our calculator assumes an overall efficiency of 77%.</li>
                    <li>Calculate the number of panels by dividing the total required wattage by the wattage of a single panel.</li>
                    <li>Estimate the required roof space by multiplying the number of panels by the average area of a residential solar panel.</li>
                  </ol>
                  <p className="text-sm font-semibold mt-4 text-destructive">Disclaimer: This is for estimation purposes only. A professional solar installer will conduct a detailed site survey to give you an accurate quote and system design.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
