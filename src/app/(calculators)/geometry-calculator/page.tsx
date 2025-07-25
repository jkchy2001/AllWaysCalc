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
import { Home } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const shapeConfig = {
    square: {
        name: 'Square',
        inputs: { side: 'Side' },
        calcs: { area: s => s*s, perimeter: s => 4*s },
        results: { Area: 'area', Perimeter: 'perimeter' }
    },
    rectangle: {
        name: 'Rectangle',
        inputs: { length: 'Length', width: 'Width' },
        calcs: { area: (l, w) => l*w, perimeter: (l, w) => 2*(l+w) },
        results: { Area: 'area', Perimeter: 'perimeter' }
    },
    circle: {
        name: 'Circle',
        inputs: { radius: 'Radius' },
        calcs: { area: r => Math.PI * r*r, circumference: r => 2 * Math.PI * r },
        results: { Area: 'area', Circumference: 'circumference' }
    },
    cube: {
        name: 'Cube',
        inputs: { side: 'Side' },
        calcs: { volume: s => s*s*s, surfaceArea: s => 6*s*s },
        results: { Volume: 'volume', 'Surface Area': 'surfaceArea' }
    },
    sphere: {
        name: 'Sphere',
        inputs: { radius: 'Radius' },
        calcs: { volume: r => (4/3) * Math.PI * r*r*r, surfaceArea: r => 4 * Math.PI * r*r },
        results: { Volume: 'volume', 'Surface Area': 'surfaceArea' }
    },
    cylinder: {
        name: 'Cylinder',
        inputs: { radius: 'Radius', height: 'Height' },
        calcs: { 
            volume: (r, h) => Math.PI * r*r * h, 
            surfaceArea: (r, h) => 2 * Math.PI * r * (r + h) 
        },
        results: { Volume: 'volume', 'Surface Area': 'surfaceArea' }
    }
};

type Shape = keyof typeof shapeConfig;

const formSchema = z.object({
  shape: z.string(),
  inputs: z.record(z.coerce.number().min(0.0001, "Dimensions must be positive.")),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  [key: string]: number;
};

export default function GeometryCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currentShape, setCurrentShape] = useState<Shape>('square');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shape: 'square',
      inputs: { side: 10 }
    },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;

  const handleShapeChange = (shape: Shape) => {
    setCurrentShape(shape);
    setValue('shape', shape);
    setResult(null);
    // Reset inputs when shape changes
    const defaultInputs = Object.keys(shapeConfig[shape].inputs).reduce((acc, key) => ({...acc, [key]: 10}), {});
    setValue('inputs', defaultInputs);
  };

  const onSubmit = (data: FormValues) => {
    const shape = data.shape as Shape;
    const config = shapeConfig[shape];
    const inputValues = Object.values(data.inputs);

    const calculatedResults: CalculationResult = {};
    for (const [calcName, calcFunc] of Object.entries(config.calcs)) {
      //@ts-ignore
      calculatedResults[calcName] = calcFunc(...inputValues);
    }
    setResult(calculatedResults);
  };
  
  const currentConfig = shapeConfig[currentShape];

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
                            <CardTitle className="font-headline text-2xl">Geometry Calculator</CardTitle>
                            <CardDescription>Calculate properties of 2D and 3D shapes.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Shape</Label>
                                    <Select onValueChange={(val) => handleShapeChange(val as Shape)} defaultValue={currentShape}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a shape" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(shapeConfig).map(shapeKey => (
                                                <SelectItem key={shapeKey} value={shapeKey}>{shapeConfig[shapeKey as Shape].name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4 p-4 border rounded-md">
                                    <h3 className="font-semibold">Dimensions</h3>
                                    {Object.entries(currentConfig.inputs).map(([key, label]) => (
                                        <div key={key} className="space-y-2">
                                            <Label htmlFor={key}>{label}</Label>
                                            <Input id={key} type="number" step="any" {...register(`inputs.${key}`)} />
                                        </div>
                                    ))}
                                    {errors.inputs && <p className="text-destructive text-sm">Please check your inputs.</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">{currentConfig.name} Properties</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        {Object.entries(currentConfig.results).map(([label, calcKey]) => (
                                            <TableRow key={label}>
                                                <TableCell className="font-medium">{label}</TableCell>
                                                <TableCell className="text-right text-lg font-bold text-primary">{result[calcKey].toFixed(3).replace(/\.?0+$/, '')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`The properties of the ${currentConfig.name.toLowerCase()} have been calculated.`} />
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
                        This calculator uses standard geometric formulas to compute the properties of various two-dimensional and three-dimensional shapes. Simply select a shape, enter its dimensions, and the results will be calculated for you.
                      </p>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
