
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
import { Home, Layers } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  areaLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  areaWidth: z.coerce.number().min(0.1, 'Width must be positive.'),
  tileLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  tileWidth: z.coerce.number().min(0.1, 'Width must be positive.'),
  groutGap: z.coerce.number().min(0).optional(),
  wastage: z.coerce.number().min(0).max(100).default(10),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalTiles: number;
  totalArea: number;
};

export default function TileCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      areaLength: 5,
      areaWidth: 4,
      tileLength: 60,
      tileWidth: 60,
      groutGap: 2,
      wastage: 10,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { areaLength, areaWidth, tileLength, tileWidth, groutGap = 0, wastage, unit } = data;
    
    // Convert all to a base unit (m or ft)
    if (unit === 'metric') {
        tileLength /= 100; // cm to m
        tileWidth /= 100;  // cm to m
        groutGap /= 1000;  // mm to m
    } else { // imperial
        tileLength /= 12; // in to ft
        tileWidth /= 12;  // in to ft
        groutGap /= 12;   // in to ft
    }

    const totalArea = areaLength * areaWidth;
    const singleTileArea = (tileLength + groutGap) * (tileWidth + groutGap);
    
    if (singleTileArea <= 0) return;

    const tilesNeeded = Math.ceil(totalArea / singleTileArea);
    const totalTiles = Math.ceil(tilesNeeded * (1 + wastage / 100));
    
    setResult({
      totalTiles,
      totalArea,
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
                <CardTitle className="font-headline text-2xl">Tile Calculator</CardTitle>
                <CardDescription>Estimate the number of tiles needed for a floor or wall.</CardDescription>
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
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (m/cm)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (ft/in)</Label>
                        </div>
                    </RadioGroup>

                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Area Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="areaLength">Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="areaLength" type="number" step="0.1" {...register('areaLength')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="areaWidth">Width ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="areaWidth" type="number" step="0.1" {...register('areaWidth')} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Tile Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tileLength">Length ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                <Input id="tileLength" type="number" step="0.1" {...register('tileLength')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tileWidth">Width ({unit === 'metric' ? 'cm' : 'in'})</Label>
                                <Input id="tileWidth" type="number" step="0.1" {...register('tileWidth')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="groutGap">Grout Gap ({unit === 'metric' ? 'mm' : 'in'})</Label>
                           <Input id="groutGap" type="number" step="0.1" {...register('groutGap')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wastage">Wastage (%)</Label>
                        <Input id="wastage" type="number" {...register('wastage')} />
                        <p className="text-xs text-muted-foreground">Recommended: 10-15% for cuts, waste, and mistakes.</p>
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Tiles</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">You will need</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Layers className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.totalTiles} tiles
                    </div>
                    <div className="text-muted-foreground">
                        To cover {result.totalArea.toFixed(2)} {unit === 'metric' ? 'm²' : 'ft²'}, including wastage.
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I'll need about ${result.totalTiles} tiles for my project.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Estimate Tiles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you determine how many tiles you need to cover a floor, wall, or other surface. It accounts for tile size, grout lines, and recommended wastage.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate the total surface area to be tiled (Length × Width).</li>
                    <li>Calculate the area of a single tile, including the grout gap on two sides to account for spacing.</li>
                    <li>Divide the total area by the single tile area to find the minimum number of tiles needed.</li>
                    <li>Add a wastage percentage to account for cuts, breaks, and future repairs. This is typically 10-15%.</li>
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
