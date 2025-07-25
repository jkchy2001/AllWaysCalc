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
import { Home, Binary } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fileSizeUnits = {
  mb: 1_000_000,
  gb: 1_000_000_000,
  tb: 1_000_000_000_000,
};

const timeUnits = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
};

type FileSizeUnit = keyof typeof fileSizeUnits;
type TimeUnit = keyof typeof timeUnits;

const formSchema = z.object({
  fileSize: z.coerce.number().min(0.1, 'File size must be positive.'),
  fileSizeUnit: z.string(),
  time: z.coerce.number().min(0.1, 'Time must be positive.'),
  timeUnit: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  bps: number;
  kbps: number;
  mbps: number;
  gbps: number;
};

export default function BitrateCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileSize: 700,
      fileSizeUnit: 'mb',
      time: 90,
      timeUnit: 'minutes',
    },
  });

  const { register, handleSubmit, control } = form;

  const onSubmit = (data: FormValues) => {
    const fileSizeInBytes = data.fileSize * fileSizeUnits[data.fileSizeUnit as FileSizeUnit];
    const fileSizeInBits = fileSizeInBytes * 8;
    const timeInSeconds = data.time * timeUnits[data.timeUnit as TimeUnit];

    if (timeInSeconds === 0) {
      setResult(null);
      return;
    }

    const bps = fileSizeInBits / timeInSeconds;
    
    setResult({
      bps,
      kbps: bps / 1000,
      mbps: bps / 1000000,
      gbps: bps / 1000000000,
    });
  };

  const formatBitrate = (value: number, unit: string) => {
    if (value < 1000) {
      return `${value.toFixed(2)} ${unit}`;
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ` ${unit}`;
  };

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
                <CardTitle className="font-headline text-2xl">Video & Audio Bitrate Calculator</CardTitle>
                <CardDescription>Calculate the required bitrate for a file of a specific size and duration.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="fileSize">File Size</Label>
                           <p className="text-xs text-muted-foreground">The target size of your video or audio file.</p>
                          <Input id="fileSize" type="number" {...register('fileSize')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                         <Label>Unit</Label>
                         <p className="text-xs text-transparent select-none">.</p>
                          <Controller
                              name="fileSizeUnit"
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
                          <Label htmlFor="time">Duration</Label>
                           <p className="text-xs text-muted-foreground">The total length of your video or audio.</p>
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
                  <Button type="submit" className="w-full">Calculate Bitrate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Calculated Bitrate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Binary className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {formatBitrate(result.mbps, 'Mbps')}
                    </div>
                     <div className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
                       <p>{formatBitrate(result.kbps, 'kbps')}</p>
                       <p>{formatBitrate(result.gbps, 'Gbps')}</p>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The required bitrate is ${result.mbps.toFixed(2)} Mbps.`} />
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
                This calculator helps you determine the bitrate (data rate) of a video or audio file based on its size and duration. This is useful for streaming, encoding, and network planning.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Methodology</AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>We convert the total file size to bits (1 byte = 8 bits).</li>
                        <li>We convert the total duration to seconds.</li>
                        <li>We divide the file size in bits by the duration in seconds to find the required bitrate in bits per second (bps).</li>
                        <li>This result is then converted to kilobits per second (kbps), megabits per second (Mbps), and gigabits per second (Gbps) for convenience.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>FAQs</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">What's the difference between bits and bytes?</h4>
                            <p>A byte is a unit of data size used for file sizes (like Megabytes, Gigabytes). A bit is the smallest unit of data. There are 8 bits in a byte. Data transfer speeds (like internet connections) and bitrates are almost always measured in bits per second (like Mbps).</p>
                        </div>
                         <div>
                            <h4 className="font-semibold">Why is this useful for video encoding?</h4>
                            <p>When you encode a video, you often have a target file size in mind (e.g., to fit on a disc or for efficient streaming). This calculator tells you what bitrate to set in your encoding software to achieve that target file size for a given video length.</p>
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
              <Link href="/bandwidth-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Bandwidth Calculator</p>
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
