
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Home, Trash2, Bolt, Zap, BatteryCharging, RotateCw } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const applianceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  wattage: z.coerce.number().min(1, "Wattage must be positive"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  appliances: z.array(applianceSchema),
  voltage: z.coerce.number().min(1, 'Voltage must be positive').default(230),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalWatts: number;
  totalAmps: number;
};

const defaultAppliances = [
  { name: 'LED Bulb', wattage: 10, quantity: 5 },
  { name: 'Ceiling Fan', wattage: 75, quantity: 2 },
  { name: 'Refrigerator', wattage: 200, quantity: 1 },
  { name: 'Television', wattage: 150, quantity: 1 },
  { name: 'Air Conditioner (1.5 Ton)', wattage: 1500, quantity: 1 },
];

export default function ElectricalLoadCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appliances: defaultAppliances,
      voltage: 230,
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "appliances",
  });

  const onSubmit = (data: FormValues) => {
    const totalWatts = data.appliances.reduce((sum, item) => sum + (item.wattage * item.quantity), 0);
    const totalAmps = totalWatts / data.voltage;
    
    setResult({
      totalWatts,
      totalAmps,
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
                <CardTitle className="font-headline text-2xl">Electrical Load Calculator</CardTitle>
                <CardDescription>Estimate the total power and current draw of your appliances to plan circuits and size generators or inverters.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                   <div>
                    <Label>Appliances</Label>
                    <p className="text-xs text-muted-foreground mb-2">List all appliances, their power consumption in Watts, and the quantity.</p>
                    <div className="space-y-2 mt-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_80px_60px_auto] items-center gap-2">
                          <Input placeholder="Appliance Name" {...register(`appliances.${index}.name`)} />
                          <Input type="number" placeholder="Watts" {...register(`appliances.${index}.wattage`)} />
                          <Input type="number" placeholder="Qty" {...register(`appliances.${index}.quantity`)} />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', wattage: 100, quantity: 1 })}>Add Appliance</Button>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="voltage">System Voltage (V)</Label>
                    <p className="text-xs text-muted-foreground">The voltage of your electrical system (e.g., 230V in India, 120V in the US).</p>
                    <Input id="voltage" type="number" {...register('voltage')} />
                    {errors.voltage && <p className="text-destructive text-sm">{errors.voltage.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Total Load</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Total Electrical Load</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Bolt className="mx-auto size-12 text-primary" />
                    <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 rounded-lg bg-background">
                            <p className="text-sm text-muted-foreground">Total Power</p>
                            <p className="text-3xl font-bold text-primary">{(result.totalWatts / 1000).toFixed(2)} kW</p>
                        </div>
                        <div className="p-4 rounded-lg bg-background">
                            <p className="text-sm text-muted-foreground">Total Current</p>
                            <p className="text-3xl font-bold text-primary">{result.totalAmps.toFixed(2)} A</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                      This helps in sizing wires, circuit breakers, and generators.
                    </p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated electrical load is ${(result.totalWatts / 1000).toFixed(2)} kW at ${form.getValues('voltage')}V.`} />
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
                This calculator helps you determine the total electrical load of various appliances. This is crucial for planning circuits, selecting appropriate wire gauges and circuit breakers, or sizing a generator or solar power system.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How is the load calculated?</AccordionTrigger>
                  <AccordionContent>
                   <p>The total power (in Watts) is the sum of the wattage of each appliance multiplied by its quantity.</p>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>Total Power (W) = Σ (Appliance Wattage × Quantity)</code>
                  </pre>
                   <p className="mt-2">The total current (in Amperes) is then calculated using a rearranged version of the power formula (P=VI):</p>
                    <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>Current (A) = Total Power (W) / Voltage (V)</code>
                  </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Why is this important?</AccordionTrigger>
                  <AccordionContent>
                    Overloading a circuit can cause breakers to trip or, in worse cases, lead to overheating and electrical fires. Understanding your total load ensures your electrical system is safe and appropriately sized for your needs. For example, a circuit with a 15 Amp breaker should not have a continuous load of more than 12 Amps (80% rule).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Where do I find the wattage of an appliance?</AccordionTrigger>
                  <AccordionContent>
                    The power consumption in Watts is usually printed on a label on the appliance itself or in its user manual. If only Voltage (V) and Current (A) are given, you can calculate wattage by multiplying them (Watts = Volts × Amps).
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                  <AccordionTrigger>Disclaimer</AccordionTrigger>
                  <AccordionContent>
                    This is an estimation for planning purposes only. Real-world power consumption can vary. For any electrical work, always consult a qualified and licensed electrician.
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
                 <Link href="/battery-backup-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <BatteryCharging className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Battery Backup</p>
                </Link>
                 <Link href="/transformer-efficiency-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <Activity className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Transformer Efficiency</p>
                </Link>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
