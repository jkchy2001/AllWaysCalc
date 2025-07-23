
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
  kilogram: { name: 'Kilogram', factor: 1 },
  gram: { name: 'Gram', factor: 0.001 },
  milligram: { name: 'Milligram', factor: 0.000001 },
  pound: { name: 'Pound', factor: 0.453592 },
  ounce: { name: 'Ounce', factor: 0.0283495 },
  tonne: { name: 'Tonne', factor: 1000 },
};

type Unit = keyof typeof units;

const convertValue = (value: number, fromUnit: Unit, toUnit: Unit): number => {
    const valueInKilograms = value * units[fromUnit].factor;
    return valueInKilograms / units[toUnit].factor;
};

export default function MassConverterPage() {
  const form = useForm({
    defaultValues: {
      fromValue: '1',
      toValue: '',
      fromUnit: 'kilogram',
      toUnit: 'pound',
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
                    <CardTitle className="font-headline text-2xl">Mass (Weight) Converter</CardTitle>
                    <CardDescription>Convert between different units of mass.</CardDescription>
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
                            <p className="text-muted-foreground">{fromValue} {units[fromUnit as Unit]?.name}(s) is equal to</p>
                            <p className="text-3xl font-bold text-primary">{watch('toValue')} {units[toUnit as Unit]?.name}(s)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">About Mass Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        Mass is the measure of the amount of matter in an object. While often used interchangeably with weight, weight is technically the force of gravity on an object. The SI base unit for mass is the kilogram.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is a Tonne?</AccordionTrigger>
                            <AccordionContent>
                            A tonne (or metric ton) is a unit of mass equal to 1,000 kilograms. It is commonly used in trade and industry for large quantities of goods.
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
