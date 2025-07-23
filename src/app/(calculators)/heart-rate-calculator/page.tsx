
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
import { Home, HeartPulse } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  age: z.coerce.number().int().min(1, 'Age must be a positive number.').max(120, 'Please enter a reasonable age.'),
});

type FormValues = z.infer<typeof formSchema>;

const heartRateZones = [
  { zone: 'Zone 1: Very Light', percentage: '50-60%', description: 'Improves overall health and helps with recovery.' },
  { zone: 'Zone 2: Light', percentage: '60-70%', description: 'Improves basic endurance and fat burning.' },
  { zone: 'Zone 3: Moderate', percentage: '70-80%', description: 'Improves cardiovascular fitness.' },
  { zone: 'Zone 4: Hard', percentage: '80-90%', description: 'Increases maximum performance capacity.' },
  { zone: 'Zone 5: Maximum', percentage: '90-100%', description: 'Develops maximum speed and power.' },
];

type CalculationResult = {
  maxHeartRate: number;
  zones: {
    name: string;
    range: string;
    description: string;
  }[];
};

export default function HeartRateCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const maxHeartRate = 220 - data.age;
    
    const calculatedZones = heartRateZones.map(zoneInfo => {
        const [low, high] = zoneInfo.percentage.replace('%','').split('-').map(Number);
        const lowBpm = Math.round(maxHeartRate * (low / 100));
        const highBpm = Math.round(maxHeartRate * (high / 100));
        return {
            name: zoneInfo.zone,
            range: `${lowBpm} - ${highBpm} BPM`,
            description: zoneInfo.description
        };
    });

    setResult({
      maxHeartRate,
      zones: calculatedZones,
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
                            <CardTitle className="font-headline text-2xl">Target Heart Rate Calculator</CardTitle>
                            <CardDescription>Find your target heart rate zones for exercise.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Your Age</Label>
                                    <Input id="age" type="number" {...register('age')} />
                                    {errors.age && <p className="text-destructive text-sm">{errors.age.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Zones</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Your Heart Rate Zones</CardTitle>
                                <CardDescription className="text-center">Max Heart Rate: ~{result.maxHeartRate} BPM</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        {result.zones.map((zone) => (
                                            <TableRow key={zone.name}>
                                                <TableCell>
                                                    <div className="font-medium">{zone.name}</div>
                                                    <div className="text-xs text-muted-foreground">{zone.description}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-primary">{zone.range}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My estimated max heart rate is ${result.maxHeartRate} BPM.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Heart Rate Zones</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        Training in different heart rate zones allows you to target specific fitness goals more effectively. By monitoring your heart rate, you can ensure you're working out at the right intensity to achieve your desired results, whether that's burning fat, improving cardiovascular health, or boosting performance.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">How is this calculated?</h3>
                          <p>This calculator first estimates your Maximum Heart Rate (MHR) using the common formula: `220 - Your Age`. It then calculates different training zones as percentages of your MHR.</p>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this formula accurate for everyone?</AccordionTrigger>
                              <AccordionContent>
                               The `220 - age` formula is a general guideline and a good starting point for most people. However, individual maximum heart rates can vary. For a more precise measurement, a clinical stress test is the most accurate method.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What zone should I train in?</AccordionTrigger>
                              <AccordionContent>
                                It depends on your goals. For general health and fat burning, zones 2 and 3 are great. For improving speed and performance, incorporating work in zones 4 and 5 is beneficial. A well-rounded fitness plan often includes training across multiple zones.
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
