
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bandwidth Calculator',
  description: 'Calculate the required network bandwidth (in Mbps or Gbps) based on the amount of data to be transferred over a specific time. Useful for network planning.',
};

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
                <CardDescription>Calculate the required network bandwidth based on the amount of data and the time to transfer it.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="dataSize">Amount of Data</Label>
                           <p className="text-xs text-muted-foreground">The total size of the data to be transferred.</p>
                          <Input id="dataSize" type="number" {...register('dataSize')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                         <Label>Unit</Label>
                         <p className="text-xs text-transparent select-none">.</p>
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
                          <p className="text-xs text-muted-foreground">The time required to complete the transfer.</p>
                          <Input id="time" type="number" {...register('time')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                          <Label>Unit</Label>
                           <p className="text-xs text-transparent select-none">.</p>
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
                This calculator helps you determine the data transfer rate (bandwidth) required to move a certain amount of data in a specific time. This is useful for network planning, estimating download/upload times, and understanding data transfer needs.
              </p>
              <Accordion type="single" collapsible className="w-full">
                 <AccordionItem value="item-1">
                    <AccordionTrigger>Methodology</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>We convert the total data size to megabits (1 byte = 8 bits). For example, 1 GB is 1000 MB, which is 8000 megabits.</li>
                        <li>We convert the total time to seconds. For example, 1 hour is 3600 seconds.</li>
                        <li>We divide the data size in megabits by the time in seconds to find the required bandwidth in megabits per second (Mbps).</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>FAQs</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">What's the difference between Megabits (Mb) and Megabytes (MB)?</h4>
                            <p>A Megabyte (MB) is a unit of data size, typically used for file sizes. A Megabit (Mb) is a unit of data transfer rate. There are 8 bits in a byte, so 1 MB/s (Megabyte per second) is equal to 8 Mbps (megabits per second). Internet service providers almost always advertise speeds in Mbps.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Why is this a theoretical calculation?</h4>
                            <p>Real-world transfer speeds can be affected by factors like network overhead (the extra data needed to manage the transfer), latency (delay), protocol efficiency, and congestion on the network. This calculator gives you the raw data rate needed, not accounting for these real-world factors.</p>
                        </div>
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
              <Link href="/download-time-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Download Time Calculator</p>
              </Link>
              <Link href="/file-size-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">File Size Calculator</p>
              </Link>
              <Link href="/bitrate-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Bitrate Calculator</p>
              </Link>
               <Link href="/ip-subnet-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">IP Subnet Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
