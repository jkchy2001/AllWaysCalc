
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
import { Home, RotateCw } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  solveFor: z.enum(['torque', 'force', 'radius']),
  torque: z.coerce.number().optional(),
  force: z.coerce.number().optional(),
  radius: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  value: number;
  unit: string;
};

export default function TorqueCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solveFor: 'torque',
      force: 100, // Newtons
      radius: 0.5, // meters
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const solveFor = watch('solveFor');

  const onSubmit = (data: FormValues) => {
    const { torque, force, radius } = data;
    let calculatedValue: number | undefined;
    let calculatedUnit = '';

    try {
        switch (data.solveFor) {
            case 'torque':
                if (force !== undefined && radius !== undefined) {
                    calculatedValue = force * radius;
                    calculatedUnit = 'Newton-meters (Nm)';
                }
                break;
            case 'force':
                 if (torque !== undefined && radius !== undefined) {
                    if (radius === 0) throw new Error("Radius cannot be zero when solving for force.");
                    calculatedValue = torque / radius;
                    calculatedUnit = 'Newtons (N)';
                }
                break;
            case 'radius':
                 if (torque !== undefined && force !== undefined) {
                    if (force === 0) throw new Error("Force cannot be zero when solving for radius.");
                    calculatedValue = torque / force;
                    calculatedUnit = 'meters (m)';
                }
                break;
        }

        if (calculatedValue !== undefined) {
             setResult({ value: calculatedValue, unit: calculatedUnit });
        } else {
             setResult(null);
        }

    } catch (e: any) {
      console.error(e);
      setResult(null);
      form.setError("root", { message: e.message || "Invalid input for calculation." });
    }
  };

  const variableMap = {
      torque: { label: 'Torque (τ)', unit: 'Nm' },
      force: { label: 'Force (F)', unit: 'N' },
      radius: { label: 'Radius (Lever Arm)', unit: 'm' },
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
                <CardTitle className="font-headline text-2xl">Torque Calculator</CardTitle>
                <CardDescription>Solve for torque, force, or radius.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Calculate</Label>
                        <Controller
                            name="solveFor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="torque">Torque (τ)</SelectItem>
                                        <SelectItem value="force">Force (F)</SelectItem>
                                        <SelectItem value="radius">Radius (r)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                  
                   <div className="space-y-4 p-4 border rounded-md">
                    {Object.entries(variableMap).map(([key, {label, unit}]) => {
                        if (key !== solveFor) {
                            return (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={key}>{label}</Label>
                                    <Input 
                                        id={key}
                                        type="number"
                                        step="any"
                                        placeholder={unit}
                                        {...register(key as keyof FormValues)}
                                    />
                                </div>
                            )
                        }
                        return null;
                    })}
                   </div>
                    {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <RotateCw className="mx-auto size-12 text-primary" />
                     <p className="text-muted-foreground">The calculated value for {variableMap[solveFor as keyof typeof variableMap].label.split(' ')[0]} is:</p>
                    <div className="text-4xl font-bold text-primary">
                        {result.value.toFixed(4).replace(/\.?0+$/, '')}
                    </div>
                     <div className="text-muted-foreground">
                        {result.unit}
                    </div>
                </CardContent>
                 <CardFooter>
                  <SharePanel resultText={`The calculated ${solveFor} is ${result.value.toFixed(4)} ${result.unit}.`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Understanding Torque</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Torque, also known as moment of force, is the rotational equivalent of linear force. It measures how much a force acting on an object causes that object to rotate. This calculator assumes the force is applied perpendicularly to the lever arm.
              </p>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                      <AccordionTrigger>Formula Used</AccordionTrigger>
                      <AccordionContent>
                       <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                        <code>
                            τ = F × r
                        </code>
                        </pre>
                        <ul className="list-disc list-inside mt-2 text-sm">
                            <li><b>τ (tau)</b> = Torque (Newton-meters)</li>
                            <li><b>F</b> = Force (Newtons)</li>
                            <li><b>r</b> = Radius / Lever Arm Length (meters)</li>
                        </ul>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
