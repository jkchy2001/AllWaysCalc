
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
import { Home, BatteryCharging } from 'lucide-react';
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
                <CardTitle className="font-headline text-2xl">Battery Backup Calculator</CardTitle>
                <CardDescription>Estimate how long a battery will last under a specific load.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batteryCapacity">Battery Capacity (Ah)</Label>
                      <Input id="batteryCapacity" type="number" {...register('batteryCapacity')} />
                      {errors.batteryCapacity && <p className="text-destructive text-sm">{errors.batteryCapacity.message}</p>}
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="batteryVoltage">Battery Voltage (V)</Label>
                      <Input id="batteryVoltage" type="number" {...register('batteryVoltage')} />
                      {errors.batteryVoltage && <p className="text-destructive text-sm">{errors.batteryVoltage.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loadPower">Total Load (Watts)</Label>
                    <Input id="loadPower" type="number" {...register('loadPower')} />
                    {errors.loadPower && <p className="text-destructive text-sm">{errors.loadPower.message}</p>}
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="usableCapacity">Usable Capacity / DoD (%)</Label>
                        <Input id="usableCapacity" type="number" {...register('usableCapacity')} />
                        {errors.usableCapacity && <p className="text-destructive text-sm">{errors.usableCapacity.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="inverterEfficiency">Inverter Efficiency (%)</Label>
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
                 This calculator helps you estimate the runtime of a battery given a constant power load. It accounts for battery capacity, voltage, and inefficiencies in the system.
                </p>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Key Terms</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2">
                            <li><b>Battery Capacity (Ah):</b> Ampere-hours measure the charge capacity of a battery.</li>
                            <li><b>Load (Watts):</b> The total power consumed by the devices connected to the battery.</li>
                            <li><b>Depth of Discharge (DoD):</b> The percentage of the battery that can be safely drained. You should not fully drain most batteries; 80% is a safe value for many lithium-ion types, while 50% is common for lead-acid.</li>
                            <li><b>Inverter Efficiency:</b> Inverters, which convert DC battery power to AC for your appliances, are not 100% efficient. Some energy is lost as heat. 90% is a typical efficiency for good quality inverters.</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
