
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
  wallLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  wallHeight: z.coerce.number().min(0.1, 'Height must be positive.'),
  brickLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  brickHeight: z.coerce.number().min(0.1, 'Height must be positive.'),
  mortarJoint: z.coerce.number().min(0).optional(),
  wastage: z.coerce.number().min(0).max(100).default(10),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalBricks: number;
  wallArea: number;
};

export default function BrickCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      wallLength: 10,
      wallHeight: 3,
      brickLength: 190,
      brickHeight: 90,
      mortarJoint: 10,
      wastage: 10,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    let { wallLength, wallHeight, brickLength, brickHeight, mortarJoint = 0, wastage, unit } = data;
    
    // Convert all to a base unit (m or ft)
    if (unit === 'metric') {
        brickLength /= 1000; // mm to m
        brickHeight /= 1000;  // mm to m
        mortarJoint /= 1000;  // mm to m
    } else { // imperial
        brickLength /= 12; // in to ft
        brickHeight /= 12;  // in to ft
        mortarJoint /= 12;   // in to ft
    }

    const wallArea = wallLength * wallHeight;
    const singleBrickArea = (brickLength + mortarJoint) * (brickHeight + mortarJoint);
    
    if (singleBrickArea <= 0) return;

    const bricksNeeded = Math.ceil(wallArea / singleBrickArea);
    const totalBricks = Math.ceil(bricksNeeded * (1 + wastage / 100));
    
    setResult({
      totalBricks,
      wallArea,
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
                <CardTitle className="font-headline text-2xl">Brick Calculator</CardTitle>
                <CardDescription>Estimate the number of bricks needed for a wall.</CardDescription>
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
                            <Label htmlFor="metric" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Metric (m/mm)</Label>
                        </div>
                        <div>
                            <RadioGroupItem value="imperial" id="imperial" className="peer sr-only" />
                            <Label htmlFor="imperial" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Imperial (ft/in)</Label>
                        </div>
                    </RadioGroup>

                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Wall Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="wallLength">Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="wallLength" type="number" step="0.1" {...register('wallLength')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wallHeight">Height ({unit === 'metric' ? 'm' : 'ft'})</Label>
                                <Input id="wallHeight" type="number" step="0.1" {...register('wallHeight')} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border rounded-md space-y-4">
                        <h3 className="font-semibold text-sm">Brick Dimensions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brickLength">Length ({unit === 'metric' ? 'mm' : 'in'})</Label>
                                <Input id="brickLength" type="number" step="0.1" {...register('brickLength')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brickHeight">Height ({unit === 'metric' ? 'mm' : 'in'})</Label>
                                <Input id="brickHeight" type="number" step="0.1" {...register('brickHeight')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="mortarJoint">Mortar Joint ({unit === 'metric' ? 'mm' : 'in'})</Label>
                           <Input id="mortarJoint" type="number" step="0.1" {...register('mortarJoint')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wastage">Wastage (%)</Label>
                        <Input id="wastage" type="number" {...register('wastage')} />
                        <p className="text-xs text-muted-foreground">Recommended: 5-10% for cuts, waste, and mistakes.</p>
                    </div>

                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Bricks</Button>
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
                        {result.totalBricks.toLocaleString()} bricks
                    </div>
                    <div className="text-muted-foreground">
                        To cover {result.wallArea.toFixed(2)} {unit === 'metric' ? 'm²' : 'ft²'}, including wastage.
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I'll need about ${result.totalBricks} bricks for my project.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How to Estimate Bricks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you determine how many bricks you need to construct a wall. Accurate measurements are key to a good estimate, and always remember to account for mortar and wastage.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>Calculate the total surface area of the wall (Length × Height).</li>
                    <li>Calculate the area of a single brick, including the mortar joint on two sides to account for spacing.</li>
                    <li>Divide the total wall area by the single brick area to find the minimum number of bricks needed.</li>
                    <li>Add a wastage percentage to account for cuts, breaks, and future repairs. This is typically 5-10%.</li>
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
