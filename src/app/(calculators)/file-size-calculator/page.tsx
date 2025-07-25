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
import { Home, FileDigit } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const speedUnits = {
  mbps: 1,
  gbps: 1000,
};

const timeUnits = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
};

type SpeedUnit = keyof typeof speedUnits;
type TimeUnit = keyof typeof timeUnits;

const formSchema = z.object({
  bitrate: z.coerce.number().min(0.1, 'Bitrate must be positive.'),
  bitrateUnit: z.string(),
  time: z.coerce.number().min(0.1, 'Time must be positive.'),
  timeUnit: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  mb: number;
  gb: number;
  tb: number;
};

export default function FileSizeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bitrate: 100,
      bitrateUnit: 'mbps',
      time: 1,
      timeUnit: 'hours',
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const bitrateInMegabitsPerSecond = data.bitrate * speedUnits[data.bitrateUnit as SpeedUnit];
    const timeInSeconds = data.time * timeUnits[data.timeUnit as TimeUnit];

    const totalMegabits = bitrateInMegabitsPerSecond * timeInSeconds;
    const totalMegabytes = totalMegabits / 8;
    
    setResult({
      mb: totalMegabytes,
      gb: totalMegabytes / 1000,
      tb: totalMegabytes / 1000000,
    });
  };

  const formatFileSize = (value: number, unit: string) => {
    if (value < 1000) {
      return `${value.toFixed(2)} ${unit}`;
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ` ${unit}`;
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
                <CardTitle className="font-headline text-2xl">File Size Calculator</CardTitle>
                <CardDescription>Estimate file size from bitrate and duration.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="bitrate">Bitrate / Speed</Label>
                          <Input id="bitrate" type="number" {...register('bitrate')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                         <Label>Unit</Label>
                          <Controller
                              name="bitrateUnit"
                              control={control}
                              render={({ field }) => (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="mbps">Mbps</SelectItem>
                                          <SelectItem value="gbps">Gbps</SelectItem>
                                      </SelectContent>
                                  </Select>
                              )}
                          />
                      </div>
                  </div>
                   {errors.bitrate && <p className="text-destructive text-sm">{errors.bitrate.message}</p>}

                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="time">Duration</Label>
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
                  {errors.time && <p className="text-destructive text-sm">{errors.time.message}</p>}

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate File Size</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Estimated File Size</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <FileDigit className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {formatFileSize(result.gb, 'GB')}
                    </div>
                     <div className="text-muted-foreground grid grid-cols-2 gap-2 text-sm">
                       <p>{formatFileSize(result.mb, 'MB')}</p>
                       <p>{formatFileSize(result.tb, 'TB')}</p>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The estimated file size is ${formatFileSize(result.gb, 'GB')}.`} />
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
                This calculator helps you estimate the size of a file based on its bitrate (e.g., of a video or audio stream) and its total duration.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>We convert the duration into seconds.</li>
                    <li>We convert the bitrate into megabits per second (Mbps).</li>
                    <li>We multiply the bitrate by the duration to get the total size in megabits.</li>
                    <li>This result is then converted to megabytes (MB), gigabytes (GB), and terabytes (TB) for convenience. Remember: 1 byte = 8 bits.</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
