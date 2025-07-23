
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

type UnitCategory = 'length' | 'mass' | 'temperature' | 'volume' | 'speed';

const unitConfig = {
  length: {
    name: 'Length',
    base: 'meter',
    units: {
      meter: { name: 'Meter', factor: 1 },
      kilometer: { name: 'Kilometer', factor: 1000 },
      centimeter: { name: 'Centimeter', factor: 0.01 },
      mile: { name: 'Mile', factor: 1609.34 },
      foot: { name: 'Foot', factor: 0.3048 },
      inch: { name: 'Inch', factor: 0.0254 },
    },
  },
  mass: {
    name: 'Mass',
    base: 'kilogram',
    units: {
      kilogram: { name: 'Kilogram', factor: 1 },
      gram: { name: 'Gram', factor: 0.001 },
      pound: { name: 'Pound', factor: 0.453592 },
      ounce: { name: 'Ounce', factor: 0.0283495 },
    },
  },
  temperature: {
    name: 'Temperature',
    base: 'celsius',
    units: {
      celsius: { name: 'Celsius' },
      fahrenheit: { name: 'Fahrenheit' },
      kelvin: { name: 'Kelvin' },
    },
  },
  volume: {
    name: 'Volume',
    base: 'liter',
    units: {
      liter: { name: 'Liter', factor: 1 },
      milliliter: { name: 'Milliliter', factor: 0.001 },
      gallon: { name: 'Gallon (US)', factor: 3.78541 },
    },
  },
  speed: {
    name: 'Speed',
    base: 'm/s',
    units: {
      'm/s': { name: 'Meters/second', factor: 1 },
      'km/h': { name: 'Kilometers/hour', factor: 0.277778 },
      mph: { name: 'Miles/hour', factor: 0.44704 },
    },
  },
};

const convertValue = (value: number, fromUnit: string, toUnit: string, category: UnitCategory): number => {
    if (category === 'temperature') {
        if (fromUnit === toUnit) return value;
        
        let celsiusValue = value;
        // Convert input to Celsius first
        if (fromUnit === 'fahrenheit') celsiusValue = (value - 32) * 5 / 9;
        if (fromUnit === 'kelvin') celsiusValue = value - 273.15;

        // Convert from Celsius to target unit
        if (toUnit === 'fahrenheit') return (celsiusValue * 9 / 5) + 32;
        if (toUnit === 'kelvin') return celsiusValue + 273.15;
        return celsiusValue; // to Celsius
    }

    const categoryData = unitConfig[category];
    const fromFactor = categoryData.units[fromUnit as keyof typeof categoryData.units].factor;
    const toFactor = categoryData.units[toUnit as keyof typeof categoryData.units].factor;
    const valueInBase = value * fromFactor;
    return valueInBase / toFactor;
};


export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>('length');
  
  const form = useForm({
    defaultValues: {
      fromValue: '1',
      toValue: '',
      fromUnit: 'meter',
      toUnit: 'foot',
    },
  });

  const { register, setValue, watch, getValues } = form;
  const { fromValue, toValue, fromUnit, toUnit } = watch();

  useEffect(() => {
    const currentCategoryData = unitConfig[category];
    const unitKeys = Object.keys(currentCategoryData.units);
    setValue('fromUnit', unitKeys[0]);
    setValue('toUnit', unitKeys[1]);
  }, [category, setValue]);

  useEffect(() => {
    const fromValNum = parseFloat(fromValue);
    if (!isNaN(fromValNum)) {
      const converted = convertValue(fromValNum, fromUnit, toUnit, category);
      setValue('toValue', Number.isFinite(converted) ? String(parseFloat(converted.toFixed(6))) : '0');
    }
  }, [fromValue, fromUnit, toUnit, category, setValue]);

  const handleToValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const toValStr = e.target.value;
      setValue('toValue', toValStr);
      const toValNum = parseFloat(toValStr);
      if (!isNaN(toValNum)) {
        const converted = convertValue(toValNum, toUnit, fromUnit, category);
        setValue('fromValue', Number.isFinite(converted) ? String(parseFloat(converted.toFixed(6))) : '0');
      }
  };
  
  const currentCategoryData = unitConfig[category];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Unit Converter</CardTitle>
              <CardDescription>Convert between various units of measurement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>Category</Label>
                   <Select onValueChange={(val) => setCategory(val as UnitCategory)} defaultValue={category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(unitConfig).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="flex-1 space-y-2">
                    <Label htmlFor="fromValue">From</Label>
                    <Input id="fromValue" type="number" {...register('fromValue')} />
                    <Select value={fromUnit} onValueChange={(val) => setValue('fromUnit', val)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                        {Object.entries(currentCategoryData.units).map(([key, value]) => (
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
                        {Object.entries(currentCategoryData.units).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
