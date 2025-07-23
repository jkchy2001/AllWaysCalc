
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
import { Home, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const units = {
  celsius: { name: 'Celsius' },
  fahrenheit: { name: 'Fahrenheit' },
  kelvin: { name: 'Kelvin' },
};

type Unit = keyof typeof units;

const convertValue = (value: number, fromUnit: Unit, toUnit: Unit): number => {
    if (fromUnit === toUnit) return value;
    
    let celsiusValue = value;
    if (fromUnit === 'fahrenheit') celsiusValue = (value - 32) * 5 / 9;
    if (fromUnit === 'kelvin') celsiusValue = value - 273.15;

    if (toUnit === 'fahrenheit') return (celsiusValue * 9 / 5) + 32;
    if (toUnit === 'kelvin') return celsiusValue + 273.15;
    return celsiusValue; // to Celsius
};

export default function TemperatureConverterPage() {
  const form = useForm({
    defaultValues: {
      fromValue: '25',
      toValue: '',
      fromUnit: 'celsius',
      toUnit: 'fahrenheit',
    },
  });

  const { register, setValue, watch } = form;
  const { fromValue, fromUnit, toUnit } = watch();

  useEffect(() => {
    const fromValNum = parseFloat(fromValue);
    if (!isNaN(fromValNum)) {
      const converted = convertValue(fromValNum, fromUnit as Unit, toUnit as Unit);
      setValue('toValue', String(parseFloat(converted.toFixed(2))));
    }
  }, [fromValue, fromUnit, toUnit, setValue]);

  const handleToValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const toValStr = e.target.value;
      setValue('toValue', toValStr);
      const toValNum = parseFloat(toValStr);
      if (!isNaN(toValNum)) {
        const converted = convertValue(toValNum, toUnit as Unit, fromUnit as Unit);
        setValue('fromValue', String(parseFloat(converted.toFixed(2))));
      }
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
                <Card className="shadow-lg">
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl">Temperature Converter</CardTitle>
                    <CardDescription>Convert between Celsius, Fahrenheit, and Kelvin.</CardDescription>
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

                <Card className="w-full bg-primary/5">
                    <CardHeader>
                        <CardTitle className="font-headline">Conversion Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <p className="text-muted-foreground">{fromValue}° {units[fromUnit as Unit]?.name} is equal to</p>
                            <p className="text-3xl font-bold text-primary">{watch('toValue')}° {units[toUnit as Unit]?.name}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">About Temperature Scales</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        Temperature is a measure of the hotness or coldness of an object. The three most common scales are Celsius, Fahrenheit, and Kelvin.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Celsius (°C)</AccordionTrigger>
                            <AccordionContent>
                                Part of the metric system, the Celsius scale is based on the freezing (0°C) and boiling (100°C) points of water at standard atmospheric pressure. It is used in most countries worldwide.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-2">
                            <AccordionTrigger>Fahrenheit (°F)</AccordionTrigger>
                            <AccordionContent>
                                Primarily used in the United States, the Fahrenheit scale sets the freezing point of water at 32°F and the boiling point at 212°F.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-3">
                            <AccordionTrigger>Kelvin (K)</AccordionTrigger>
                            <AccordionContent>
                                The Kelvin scale is the base unit of thermodynamic temperature in the SI system. It is an absolute scale where 0 K represents absolute zero—the point at which all thermal motion ceases.
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
