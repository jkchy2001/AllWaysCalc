
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
import { Home, Construction } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roofPitches = {
    "2:12": 2/12, "3:12": 3/12, "4:12": 4/12, "5:12": 5/12, "6:12": 6/12,
    "7:12": 7/12, "8:12": 8/12, "9:12": 9/12, "10:12": 10/12, "11:12": 11/12, "12:12": 1,
};

const formSchema = z.object({
  unit: z.enum(['metric', 'imperial']),
  buildingLength: z.coerce.number().min(0.1, 'Length must be positive.'),
  buildingWidth: z.coerce.number().min(0.1, 'Width must be positive.'),
  pitch: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  totalArea: number;
};

export default function RoofAreaCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      buildingLength: 15,
      buildingWidth: 10,
      pitch: "4:12",
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const unit = watch('unit');

  const onSubmit = (data: FormValues) => {
    const { buildingLength, buildingWidth, pitch } = data;
    
    const run = buildingWidth / 2;
    const rise = run * roofPitches[pitch as keyof typeof roofPitches];
    
    const rafterLength = Math.sqrt(Math.pow(run, 2) + Math.pow(rise, 2));
    
    const totalArea = rafterLength * buildingLength * 2;
    
    setResult({
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
                <CardTitle className="font-headline text-2xl">Roof Area Calculator</CardTitle>
                <CardDescription>Estimate the total area of a simple gable roof.</CardDescription>
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
                            <Label htmlFor="buildingLength">Building Length ({unit === 'metric' ? 'm' : 'ft'})</Label>
                            <Input id="buildingLength" type="number" step="0.1" {...register('buildingLength')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="buildingWidth">Building Width/Span ({unit === 'metric' ? 'm' : 'ft'})</Label>
                            <Input id="buildingWidth" type="number" step="0.1" {...register('buildingWidth')} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Roof Pitch (Rise:Run)</Label>
                        <Controller
                            name="pitch"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(roofPitches).map(pitchKey => (
                                            <SelectItem key={pitchKey} value={pitchKey}>{pitchKey}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Roof Area</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Estimated Roof Area</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <Construction className="mx-auto size-12 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                        {result.totalArea.toFixed(2)} {unit === 'metric' ? 'm²' : 'ft²'}
                    </div>
                    <div className="text-muted-foreground">
                        This is the total area for both sides of the roof.
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My estimated roof area is ${result.totalArea.toFixed(2)} ${unit === 'metric' ? 'square meters' : 'square feet'}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How Roof Area is Calculated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This calculator helps you determine the area of a simple gable roof. This is useful for ordering roofing materials like shingles or metal sheets. Remember to add wastage (typically 10-15%) to this number when purchasing materials.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <ol className="list-decimal list-inside space-y-2 mt-2 p-4 rounded-md bg-muted">
                    <li>The 'run' of the roof is calculated as half the building width.</li>
                    <li>The 'rise' is calculated based on the selected pitch (Rise = Run × Pitch Ratio).</li>
                    <li>The Pythagorean theorem (a² + b² = c²) is used to find the length of the sloping rafter (c = √(run² + rise²)).</li>
                    <li>The area of one side of the roof is the rafter length multiplied by the building length.</li>
                    <li>This is doubled to get the total area for a standard gable roof.</li>
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
