
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
import { Home, Layers3 } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  roomLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  roomWidth: z.coerce.number().min(0.1, 'Width must be positive.'),
  wallHeight: z.coerce.number().min(0.1, 'Height must be positive.'),
  rollWidth: z.coerce.number().min(0.1, 'Roll width must be positive.'),
  rollLength: z.coerce.number().min(0.1, 'Roll length must be positive.'),
  patternRepeat: z.coerce.number().min(0).optional(),
  doors: z.coerce.number().int().min(0).optional(),
  windows: z.coerce.number().int().min(0).optional(),
  wastage: z.coerce.number().min(0).max(100).default(15),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalRolls: number;
  totalWallArea: number;
};

// Standard door/window sizes for deduction (in meters and feet)
const DOOR_AREA_METRIC = 1.6; // 0.8m x 2m
const WINDOW_AREA_METRIC = 1.44; // 1.2m x 1.2m
const DOOR_AREA_IMPERIAL = 21; // 3ft x 7ft
const WINDOW_AREA_IMPERIAL = 15; // 3ft x 5ft

export default function WallpaperCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      roomLength: 4,
      roomWidth: 3,
      wallHeight: 2.5,
      rollWidth: 52, // cm
      rollLength: 10, // m
      patternRepeat: 0,
      doors: 1,
      windows: 1,
      wastage: 15,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { roomLength, roomWidth, wallHeight, rollWidth, rollLength, patternRepeat = 0, doors = 0, windows = 0, wastage, unit } = data;
    
    // Convert roll dimensions to the primary unit (m or ft)
    if (unit === 'metric') {
        rollWidth /= 100; // cm to m
        patternRepeat /= 100; // cm to m
    } else { // imperial
        rollWidth /= 12; // in to ft
        patternRepeat /= 12; // in to ft
    }

    const roomPerimeter = 2 * (roomLength + roomWidth);
    let totalWallArea = roomPerimeter * wallHeight;
    
    let deductionArea = 0;
    if (unit === 'metric') {
      deductionArea = (doors * DOOR_AREA_METRIC) + (windows * WINDOW_AREA_METRIC);
    } else {
      deductionArea = (doors * DOOR_AREA_IMPERIAL) + (windows * WINDOW_AREA_IMPERIAL);
    }
    
    totalWallArea = Math.max(0, totalWallArea - deductionArea);

    const adjustedWallHeight = wallHeight + patternRepeat;
    const dropsPerRoll = Math.floor(rollLength / adjustedWallHeight);
    
    if (dropsPerRoll === 0) {
      // Handle case where a single drop is longer than the roll
      setResult({ totalRolls: Infinity, totalWallArea });
      return;
    }

    const totalDropsNeeded = Math.ceil(roomPerimeter / rollWidth);
    let totalRolls = Math.ceil(totalDropsNeeded / dropsPerRoll);
    
    // Add wastage
    totalRolls = Math.ceil(totalRolls * (1 + wastage / 100));
    
    setResult({
      totalRolls,
      totalWallArea: totalWallArea,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Online Wallpaper Calculator</CardTitle>
                <CardDescription>Estimate the number of wallpaper rolls needed for a room, accounting for pattern repeats.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <RadioGroup
                        defaultValue="metric"
                        className="grid grid-cols-2 gap-4"
                        value={unit}
                        onValueChange={(value) => setValue('unit', value as 'metric' | 'imperial')}
                    >
                        <div>
                            <RadioGroupItem value="metric" id="metric" className="peer sr-only" />
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (m/cm)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (ft/in)</Label>
                        </div>
                    </RadioGroup>

                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Room Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="roomLength">Room Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="roomLength" type="number" step="0.1" {...register('roomLength')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roomWidth">Room Width ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="roomWidth" type="number" step="0.1" {...register('roomWidth')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="wallHeight">Wall Height ({unit === 'metric' ? 'm' : 'ft'})</Label>
                           <Input id="wallHeight" type="number" step="0.1" {...register('wallHeight')} />
                        </div>
                    </div>
                    
                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Wallpaper Roll Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="rollWidth">Roll Width ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                <Input id="rollWidth" type="number" step="0.1" {...register('rollWidth')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rollLength">Roll Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="rollLength" type="number" step="0.1" {...register('rollLength')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="patternRepeat">Pattern Repeat ({unit === 'metric' ? 'cm' : 'in'})</Label>
                           <Input id="patternRepeat" type="number" step="0.1" {...register('patternRepeat')} />
                           <p className="text-xs text-muted-foreground">Enter 0 if there's no pattern.</p>
                        </div>
                    </div>
                    
                     <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Deductions (Optional)</h3>
                        <p className="text-xs text-muted-foreground">The calculator subtracts standard door/window areas.</p>
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

                    <div className="space-y-2">
                        <Label htmlFor="wastage">Wastage (%)</Label>
                        <Input id="wastage" type="number" {...register('wastage')} />
                        <p className="text-xs text-muted-foreground">Recommended: 10-15% for cuts and mistakes.</p>
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Calculate Rolls Needed</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-headline">You will need</CardTitle>
                  <CardDescription>This is an estimate. Always buy a little extra.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Layers3 className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {isFinite(result.totalRolls) ? `${result.totalRolls} rolls` : 'Invalid Dimensions'}
                    </div>
                    <div className="text-muted-foreground">
                        {isFinite(result.totalRolls) 
                            ? `To cover approximately ${result.totalWallArea.toFixed(2)} ${unit === 'metric' ? 'm²' : 'ft²'}, including wastage.`
                            : `A single drop is longer than the roll length.`
                        }
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I'll need about ${result.totalRolls} rolls of wallpaper for my project.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-headline">How to Estimate Wallpaper</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you determine how many rolls of wallpaper you need for a room. Accounting for pattern repeats and wastage is key to an accurate estimate.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Methodology</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>First, we calculate the perimeter of the room.</li>
                        <li>Then, we determine how many vertical "drops" or strips of wallpaper are needed to cover the perimeter based on the roll width.</li>
                        <li>We calculate how many full drops can be cut from a single roll. Crucially, this step must account for the pattern repeat, as each drop must be cut longer than the wall height to allow for pattern matching.</li>
                        <li>The total number of drops needed is divided by the number of drops per roll to find the minimum number of rolls.</li>
                        <li>Finally, a wastage percentage is added to cover mistakes, offcuts, and to have some spare for future repairs.</li>
                      </ol>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                    <AccordionTrigger>Why is the pattern repeat important?</AccordionTrigger>
                    <AccordionContent>
                     When wallpaper has a pattern, you can't just cut strips to the exact height of the wall. Each new strip must be shifted up or down to align with the pattern of the previous one. This means you have to cut each strip longer than the wall height, leading to more waste and requiring more wallpaper overall. A larger pattern repeat results in more waste.
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
                <Link href="/paint-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Paint Calculator</p>
                </Link>
                <Link href="/tile-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Tile Calculator</p>
                </Link>
                <Link href="/flooring-cost-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Flooring Cost</p>
                </Link>
                 <Link href="/stair-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                  <p className="font-semibold">Stair Calculator</p>
                </Link>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
