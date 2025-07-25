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
import { Home, DownloadCloud } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const fileSizeUnits = {
  mb: 1,
  gb: 1000,
  tb: 1000000,
};

const speedUnits = {
  mbps: 1,
  gbps: 1000,
};

type FileSizeUnit = keyof typeof fileSizeUnits;
type SpeedUnit = keyof typeof speedUnits;

const formSchema = z.object({
  fileSize: z.coerce.number().min(0.1, 'File size must be positive.'),
  fileSizeUnit: z.string(),
  downloadSpeed: z.coerce.number().min(0.1, 'Download speed must be positive.'),
  downloadSpeedUnit: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  timeInSeconds: number;
};

export default function DownloadTimeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileSize: 100,
      fileSizeUnit: 'gb',
      downloadSpeed: 100,
      downloadSpeedUnit: 'mbps',
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const fileSizeInMegabits = data.fileSize * fileSizeUnits[data.fileSizeUnit as FileSizeUnit] * 8;
    const speedInMegabitsPerSecond = data.downloadSpeed * speedUnits[data.downloadSpeedUnit as SpeedUnit];

    if (speedInMegabitsPerSecond === 0) {
      setResult(null);
      return;
    }

    const timeInSeconds = fileSizeInMegabits / speedInMegabitsPerSecond;
    setResult({ timeInSeconds });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours} hours and ${minutes} minutes`;
  }

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
                <CardTitle className="font-headline text-2xl">Download Time Calculator</CardTitle>
                <CardDescription>Estimate how long a file download will take.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="fileSize">File Size</Label>
                          <Input id="fileSize" type="number" {...register('fileSize')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                         <Label>Unit</Label>
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
                   {errors.fileSize && <p className="text-destructive text-sm">{errors.fileSize.message}</p>}

                  <div className="flex gap-4">
                      <div className="space-y-2 w-2/3">
                          <Label htmlFor="downloadSpeed">Download Speed</Label>
                          <Input id="downloadSpeed" type="number" {...register('downloadSpeed')} />
                      </div>
                      <div className="space-y-2 w-1/3">
                          <Label>Unit</Label>
                          <Controller
                              name="downloadSpeedUnit"
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
                  {errors.downloadSpeed && <p className="text-destructive text-sm">{errors.downloadSpeed.message}</p>}

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Time</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Estimated Download Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <DownloadCloud className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {formatTime(result.timeInSeconds)}
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated download time is ${formatTime(result.timeInSeconds)}.`} />
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
                This calculator helps you estimate the time it will take to download a file based on its size and your internet connection speed.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>We convert the file size to megabits (1 byte = 8 bits).</li>
                    <li>We convert the download speed to megabits per second (Mbps).</li>
                    <li>We divide the file size in megabits by the speed in megabits per second to find the total time in seconds.</li>
                  </ol>
                  <p className="text-sm font-semibold mt-4 text-destructive">Disclaimer: This is a theoretical calculation. Real-world download speeds can be affected by network congestion, server load, and other factors.</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Calculators</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/bandwidth-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Bandwidth Calculator</p>
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
