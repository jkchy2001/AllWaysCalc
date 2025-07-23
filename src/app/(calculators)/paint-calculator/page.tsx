
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
import { Home, PaintBucket } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  wallHeight: z.coerce.number().min(0.1, 'Height must be positive.'),
  wallWidth: z.coerce.number().min(0.1, 'Width must be positive.'),
  coats: z.coerce.number().int().min(1, 'At least one coat is required.'),
  paintCoverage: z.coerce.number().min(1, 'Coverage must be positive.'),
  doors: z.coerce.number().int().min(0).optional(),
  windows: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalPaintNeeded: number;
  totalArea: number;
};

// Standard door/window sizes for deduction
const DOOR_AREA_METRIC = 1.6; // 0.8m x 2m
const WINDOW_AREA_METRIC = 1.44; // 1.2m x 1.2m
const DOOR_AREA_IMPERIAL = 21; // 3ft x 7ft
const WINDOW_AREA_IMPERIAL = 15; // 3ft x 5ft

export default function PaintCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      wallHeight: 3,
      wallWidth: 5,
      coats: 2,
      paintCoverage: 35, // 35 m^2 or ~375 sq ft
      doors: 1,
      windows: 1,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { wallHeight, wallWidth, coats, paintCoverage, doors = 0, windows = 0, unit } = data;

    const totalWallArea = wallHeight * wallWidth;
    let deductionArea = 0;
    
    if (unit === 'metric') {
      deductionArea = (doors * DOOR_AREA_METRIC) + (windows * WINDOW_AREA_METRIC);
    } else { // imperial
      deductionArea = (doors * DOOR_AREA_IMPERIAL) + (windows * WINDOW_AREA_IMPERIAL);
    }
    
    const areaToPaint = Math.max(0, totalWallArea - deductionArea);
    const totalAreaForCoats = areaToPaint * coats;
    const totalPaintNeeded = Math.ceil(totalAreaForCoats / paintCoverage);
    
    setResult({
      totalPaintNeeded,
      totalArea: areaToPaint,
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
                <CardTitle className="font-headline text-2xl">Paint Calculator</CardTitle>
                <CardDescription>Estimate how many cans of paint you'll need for your project.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <RadioGroup
                        defaultValue="metric"
                        className="grid grid-cols-2 gap-4"
                        value={unit}
                        onValueChange={(value) => form.setValue('unit', value as 'metric' | 'imperial')}
                    >
                        <div>
                            <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (m)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (ft)</Label>
                        </div>
                    </RadioGroup>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="wallHeight">Wall Height ({unit === 'metric' ? 'm' : 'ft'})</Label>
                            <Input id="wallHeight" type="number" step="0.1" {...register('wallHeight')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wallWidth">Wall Width ({unit === 'metric' ? 'm' : 'ft'})</Label>
                            <Input id="wallWidth" type="number" step="0.1" {...register('wallWidth')} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="coats">Number of Coats</Label>
                        <Input id="coats" type="number" {...register('coats')} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="paintCoverage">Paint Coverage per Can ({unit === 'metric' ? 'm²' : 'ft²'})</Label>
                        <Input id="paintCoverage" type="number" {...register('paintCoverage')} />
                    </div>

                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Deductions (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="doors">Number of Doors</Label>
                                <Input id="doors" type="number" {...register('doors')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="windows">Number of Windows</Label>
                                <Input id="windows" type="number" {...register('windows')} />
                            </div>
                        </div>
                    </div>
                    {(errors.wallHeight || errors.wallWidth || errors.coats || errors.paintCoverage) && <p className="text-destructive text-sm">Please fill in all required fields.</p>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Paint Needed</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">You will need</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <PaintBucket className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.totalPaintNeeded} can(s)
                    </div>
                    <div className="text-muted-foreground">
                        To cover {result.totalArea.toFixed(2)} {unit === 'metric' ? 'm²' : 'ft²'} with {form.getValues('coats')} coat(s).
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I'll need about ${result.totalPaintNeeded} cans of paint for my project.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Estimate Paint</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you avoid buying too much or too little paint. Accurate measurements are key to a good estimate.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate the total surface area of the walls you plan to paint.</li>
                    <li>Subtract the area of any doors and windows. This calculator uses standard sizes.</li>
                    <li>Multiply the paintable area by the number of coats you plan to apply.</li>
                    <li>Divide that total area by the coverage listed on your paint can to find the number of cans you need.</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-bold font-headline">Tips</h3>
                   <ul className="list-disc list-inside mt-2 space-y-1">
                     <li>It's always a good idea to buy a little extra paint to account for touch-ups and variations in wall texture.</li>
                     <li>Porous or new unprimed walls will absorb more paint, so you may need more than estimated.</li>
                   </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
