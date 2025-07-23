
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
import { Home, Signal } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const dataSizeUnits = {
  mb: 1,
  gb: 1000,
  tb: 1000000,
};

const timeUnits = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
};

type DataSizeUnit = keyof typeof dataSizeUnits;
type TimeUnit = keyof typeof timeUnits;

const formSchema = z.object({
  dataSize: z.coerce.number().min(0.1, 'Data size must be positive.'),
  dataSizeUnit: z.string(),
  time: z.coerce.number().min(0.0001, 'Time must be positive.'),
  timeUnit: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  mbps: number;
  gbps: number;
};

export default function BandwidthCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataSize: 100,
      dataSizeUnit: 'gb',
      time: 1,
      timeUnit: 'hours',
    },
  });

  const { register, handleSubmit, control } = form;

  const onSubmit = (data: FormValues) => {
    const dataSizeInMegabits = data.dataSize * dataSizeUnits[data.dataSizeUnit as DataSizeUnit] * 8;
    const timeInSeconds = data.time * timeUnits[data.timeUnit as TimeUnit];

    if (timeInSeconds === 0) {
      setResult(null);
      return;
    }

    const mbps = dataSizeInMegabits / timeInSeconds;
    const gbps = mbps / 1000;
    
    setResult({ mbps, gbps });
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
                <CardTitle className="font-headline text-2xl">Bandwidth Calculator</CardTitle>
                <CardDescription>Calculate bandwidth from data amount and time.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="dataSize">Amount of Data</Label>
                          <Input id="dataSize" type="number" {...register('dataSize')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                         <Label>Unit</Label>
                          <Controller
                              name="dataSizeUnit"
                              control={control}
                              render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="mb">MB</SelectItem>
                                          <SelectItem value="gb">GB</SelectItem>
                                          <SelectItem value="tb">TB</SelectItem>
                                      </SelectContent>
                                  </Select>
                              )}
                          />
                      </div>
                  </div>

                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="time">Time Taken</Label>
                          <Input id="time" type="number" {...register('time')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                          <Label>Unit</Label>
                          <Controller
                              name="timeUnit"
                              control={control}
                              render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="seconds">Seconds</SelectItem>
                                          <SelectItem value="minutes">Minutes</SelectItem>
                                          <SelectItem value="hours">Hours</SelectItem>
                                      </SelectContent>
                                  </Select>
                              )}
                          />
                      </div>
                  </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Bandwidth</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Calculated Bandwidth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Signal className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.mbps.toFixed(2)} Mbps
                    </div>
                     <div className="text-muted-foreground">
                        (or {result.gbps.toFixed(2)} Gbps)
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The required bandwidth is ${result.mbps.toFixed(2)} Mbps.`} />
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
                This calculator helps you determine the data transfer rate (bandwidth) required to move a certain amount of data in a specific time.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>We convert the total data size to megabits (1 byte = 8 bits).</li>
                    <li>We convert the total time to seconds.</li>
                    <li>We divide the data size in megabits by the time in seconds to find the required bandwidth in megabits per second (Mbps).</li>
                  </ol>
                  <p className="text-sm font-semibold mt-4 text-destructive">Disclaimer: This is a theoretical calculation. Real-world speeds can be affected by factors like network overhead, latency, and protocol efficiency.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
