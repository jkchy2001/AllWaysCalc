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
import { Home, BatteryCharging, Ohm, OhmSquare, Bolt, Zap, TrendingDown, Sun } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  batteryCapacity: z.coerce.number().min(1, 'Capacity must be positive.'),
  batteryVoltage: z.coerce.number().min(1, 'Voltage must be positive.'),
  loadPower: z.coerce.number().min(1, 'Load must be positive.'),
  usableCapacity: z.coerce.number().min(1, 'Usable capacity must be positive.').max(100),
  inverterEfficiency: z.coerce.number().min(1, 'Efficiency must be positive.').max(100),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  backupTimeHours: number;
};

export default function BatteryBackupCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batteryCapacity: 100,
      batteryVoltage: 12,
      loadPower: 150,
      usableCapacity: 80,
      inverterEfficiency: 90,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { batteryCapacity, batteryVoltage, loadPower, usableCapacity, inverterEfficiency } = data;

    const totalEnergyWh = batteryCapacity * batteryVoltage;
    const usableEnergyWh = totalEnergyWh * (usableCapacity / 100);
    const adjustedLoadW = loadPower / (inverterEfficiency / 100);

    const backupTimeHours = usableEnergyWh / adjustedLoadW;

    setResult({
      backupTimeHours,
    });
  };
  
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

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
                <CardTitle className="font-headline text-2xl">Battery Backup & Runtime Calculator</CardTitle>
                <CardDescription>Estimate how long a battery will last under a specific load, ideal for UPS, inverters, or solar systems.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batteryCapacity">Battery Capacity (Ah)</Label>
                      <p className="text-xs text-muted-foreground">Ampere-hours rating of your battery.</p>
                      <Input id="batteryCapacity" type="number" {...register('batteryCapacity')} />
                      {errors.batteryCapacity && <p className="text-destructive text-sm">{errors.batteryCapacity.message}</p>}
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="batteryVoltage">Battery Voltage (V)</Label>
                      <p className="text-xs text-muted-foreground">Nominal voltage of your battery.</p>
                      <Input id="batteryVoltage" type="number" {...register('batteryVoltage')} />
                      {errors.batteryVoltage && <p className="text-destructive text-sm">{errors.batteryVoltage.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loadPower">Total Load (Watts)</Label>
                    <p className="text-xs text-muted-foreground">Total power consumed by all connected devices.</p>
                    <Input id="loadPower" type="number" {...register('loadPower')} />
                    {errors.loadPower && <p className="text-destructive text-sm">{errors.loadPower.message}</p>}
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="usableCapacity">Usable Capacity / DoD (%)</Label>
                        <p className="text-xs text-muted-foreground">Max percentage of battery to use.</p>
                        <Input id="usableCapacity" type="number" {...register('usableCapacity')} />
                        {errors.usableCapacity && <p className="text-destructive text-sm">{errors.usableCapacity.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="inverterEfficiency">Inverter Efficiency (%)</Label>
                        <p className="text-xs text-muted-foreground">Efficiency of the DC to AC converter.</p>
                        <Input id="inverterEfficiency" type="number" {...register('inverterEfficiency')} />
                        {errors.inverterEfficiency && <p className="text-destructive text-sm">{errors.inverterEfficiency.message}</p>}
                    </div>
                   </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate Backup Time</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Estimated Backup Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <BatteryCharging className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {formatHours(result.backupTimeHours)}
                    </div>
                    <p className="text-muted-foreground">This is the estimated time the battery can power the specified load.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated battery backup time is ${formatHours(result.backupTimeHours)}.`} />
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
                 This calculator helps you estimate the runtime of a battery given a constant power load. It accounts for battery capacity, voltage, and inefficiencies in the system like inverter loss and depth of discharge.
                </p>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Key Terms Explained</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p><b>Battery Capacity (Ah):</b> Ampere-hours measure the charge capacity. A higher Ah means a longer runtime.</p>
                        <p><b>Load (Watts):</b> The total power consumed by the devices connected to the battery. You can usually find this on the device's power label.</p>
                        <p><b>Usable Capacity / Depth of Discharge (DoD):</b> The percentage of the battery you can safely drain without damaging it. Discharging to 100% can significantly reduce a battery's lifespan. 80% is a safe value for many lithium-ion types, while 50% is often recommended for lead-acid batteries.</p>
                        <p><b>Inverter Efficiency:</b> Inverters convert DC battery power to AC for your appliances. This process isn't 100% efficient; some energy is lost as heat. 90% is a typical efficiency for good quality inverters.</p>
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                        <AccordionTrigger>Calculation Formulas</AccordionTrigger>
                        <AccordionContent>
                          <ol className="list-decimal list-inside space-y-2">
                            <li><b>Total Energy (Wh):</b> First, we find the total energy stored in the battery in Watt-hours.
                                <pre className="p-2 mt-1 rounded-md bg-muted font-code text-xs">Total Energy (Wh) = Capacity (Ah) × Voltage (V)</pre>
                            </li>
                            <li><b>Usable Energy (Wh):</b> We then account for the usable capacity.
                                <pre className="p-2 mt-1 rounded-md bg-muted font-code text-xs">Usable Energy = Total Energy × (Usable Capacity % / 100)</pre>
                            </li>
                            <li><b>Adjusted Load (W):</b> The actual power drawn from the battery is higher than the load due to inverter inefficiency.
                                 <pre className="p-2 mt-1 rounded-md bg-muted font-code text-xs">Adjusted Load = Load (W) / (Inverter Efficiency % / 100)</pre>
                            </li>
                            <li><b>Backup Time (Hours):</b> Finally, we calculate the runtime.
                                <pre className="p-2 mt-1 rounded-md bg-muted font-code text-xs">Backup Time = Usable Energy / Adjusted Load</pre>
                            </li>
                          </ol>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>Disclaimer</AccordionTrigger>
                        <AccordionContent>
                            <p>This is an estimate. Real-world battery performance can be affected by temperature, battery age, and the specific discharge curve of the battery chemistry. Always consult manufacturer specifications for critical applications.</p>
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
                <Zap className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Ohm's Law</p>
              </Link>
              <Link href="/voltage-drop-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <TrendingDown className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Voltage Drop</p>
              </Link>
              <Link href="/electrical-load-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <Bolt className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Electrical Load</p>
              </Link>
               <Link href="/solar-panel-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <Sun className="mx-auto mb-2 size-6" />
                <p className="font-semibold">Solar Panel</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
