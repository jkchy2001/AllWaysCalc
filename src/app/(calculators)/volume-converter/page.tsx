'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Home, ChevronsRight, Beaker, Ruler, Scale, Thermometer, Gauge } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const units = {
  liter: { name: 'Liter', factor: 1 },
  milliliter: { name: 'Milliliter', factor: 0.001 },
  gallon: { name: 'Gallon (US)', factor: 3.78541 },
  quart: { name: 'Quart (US)', factor: 0.946353 },
  pint: { name: 'Pint (US)', factor: 0.473176 },
  cup: { name: 'Cup (US)', factor: 0.24 }, // standard cup, not legal
};

type Unit = keyof typeof units;

const convertValue = (value: number, fromUnit: Unit, toUnit: Unit): number => {
    const valueInLiters = value * units[fromUnit].factor;
    return valueInLiters / units[toUnit].factor;
};

export default function VolumeConverterPage() {
  const form = useForm({
    defaultValues: {
      fromValue: '1',
      toValue: '',
      fromUnit: 'liter',
      toUnit: 'gallon',
    },
  });

  const { register, setValue, watch } = form;
  const { fromValue, fromUnit, toUnit } = watch();

  useEffect(() => {
    const fromValNum = parseFloat(fromValue);
    if (!isNaN(fromValNum)) {
      const converted = convertValue(fromValNum, fromUnit as Unit, toUnit as Unit);
      setValue('toValue', String(parseFloat(converted.toFixed(6))));
    }
  }, [fromValue, fromUnit, toUnit, setValue]);

  const handleToValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const toValStr = e.target.value;
      setValue('toValue', toValStr);
      const toValNum = parseFloat(toValStr);
      if (!isNaN(toValNum)) {
        const converted = convertValue(toValNum, toUnit as Unit, fromUnit as Unit);
        setValue('fromValue', String(parseFloat(converted.toFixed(6))));
      }
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
                    <CardTitle className="font-headline text-2xl">Online Volume Converter</CardTitle>
                    <CardDescription>Quickly convert between liters, gallons, milliliters, and other common units of volume.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="fromValue">From</Label>
                                <Input id="fromValue" type="number" {...register('fromValue')} />
                                <Select value={fromUnit} onValueChange={(val) => setValue('fromUnit', val)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                    {Object.entries(units).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{value.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="self-center pt-8">
                                <ChevronsRight className="size-8 text-muted-foreground"/>
                            </div>

                            <div className="flex-1 space-y-2">
                                <Label htmlFor="toValue">To</Label>
                                <Input id="toValue" type="number" {...register('toValue')} onChange={handleToValueChange} />
                                <Select value={toUnit} onValueChange={(val) => setValue('toUnit', val)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                    {Object.entries(units).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{value.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-headline">Conversion Details</CardTitle>
                         <CardDescription>The converted volume based on your input.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <Beaker className="mx-auto size-12 text-primary" />
                        <div className="text-center">
                            <p className="text-muted-foreground">{fromValue} {units[fromUnit as Unit]?.name}(s) is equal to</p>
                            <p className="text-3xl font-bold text-primary">{watch('toValue')} {units[toUnit as Unit]?.name}(s)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline">About Volume Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        Volume is the amount of three-dimensional space occupied by a substance. The SI base unit for volume is the liter. This converter helps switch between common metric and US customary units of volume.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is a US Gallon?</AccordionTrigger>
                            <AccordionContent>
                            The US liquid gallon is defined as 231 cubic inches, which is exactly 3.78541 liters. It's different from the imperial gallon used in the United Kingdom.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How does the conversion work?</AccordionTrigger>
                            <AccordionContent>
                            To ensure accuracy, all input values are first converted to a base unit (liters). From there, the value is converted to the desired output unit. This two-step process ensures that direct conversion factors between all units are not required.
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
                <Link href="/length-converter" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                   <Ruler className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Length Converter</p>
                </Link>
                <Link href="/mass-converter" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                   <Scale className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Mass Converter</p>
                </Link>
                 <Link href="/temperature-converter" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                    <Thermometer className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Temperature Converter</p>
                </Link>
                 <Link href="/speed-converter" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                    <Gauge className="mx-auto mb-2 size-6" />
                  <p className="font-semibold">Speed Converter</p>
                </Link>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
