
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home, Footprints } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ruler, Scale, Thermometer, Gauge } from 'lucide-react';

const mensSizes = [
    { us: 6, uk: 5.5, india: 5.5, eu: 39 },
    { us: 6.5, uk: 6, india: 6, eu: 39 },
    { us: 7, uk: 6.5, india: 6.5, eu: 40 },
    { us: 7.5, uk: 7, india: 7, eu: 40.5 },
    { us: 8, uk: 7.5, india: 7.5, eu: 41 },
    { us: 8.5, uk: 8, india: 8, eu: 41.5 },
    { us: 9, uk: 8.5, india: 8.5, eu: 42 },
    { us: 9.5, uk: 9, india: 9, eu: 42.5 },
    { us: 10, uk: 9.5, india: 9.5, eu: 43 },
    { us: 10.5, uk: 10, india: 10, eu: 43.5 },
    { us: 11, uk: 10.5, india: 10.5, eu: 44 },
    { us: 11.5, uk: 11, india: 11, eu: 44.5 },
    { us: 12, uk: 11.5, india: 11.5, eu: 45 },
    { us: 13, uk: 12.5, india: 12.5, eu: 46 },
    { us: 14, uk: 13.5, india: 13.5, eu: 47 },
];

const womensSizes = [
    { us: 4, uk: 2, india: 2, eu: 35 },
    { us: 5, uk: 3, india: 3, eu: 35.5 },
    { us: 6, uk: 4, india: 4, eu: 36.5 },
    { us: 7, uk: 5, india: 5, eu: 37.5 },
    { us: 8, uk: 6, india: 6, eu: 38.5 },
    { us: 9, uk: 7, india: 7, eu: 39.5 },
    { us: 10, uk: 8, india: 8, eu: 40.5 },
    { us: 11, uk: 9, india: 9, eu: 41.5 },
    { us: 12, uk: 10, india: 10, eu: 42.5 },
];

type SizeChart = typeof mensSizes;
type Region = 'us' | 'uk' | 'india' | 'eu';

export default function ShoeSizeConverterPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [result, setResult] = useState<any>(null);
  
  const form = useForm({
    defaultValues: {
      category: 'mens',
      fromRegion: 'us',
      fromSize: '7',
    },
  });

  const { control, watch, setValue } = form;
  const category = watch('category');
  const fromRegion = watch('fromRegion');
  const fromSize = watch('fromSize');

  useEffect(() => {
    const sizeData = category === 'mens' ? mensSizes : womensSizes;
    const selectedSize = parseFloat(fromSize);
    const selectedRegion = fromRegion as Region;
    
    const matchingSize = sizeData.find(size => size[selectedRegion] === selectedSize);
    setResult(matchingSize || null);

  }, [category, fromRegion, fromSize]);
  
  const currentSizeData = category === 'mens' ? mensSizes : womensSizes;
  const availableSizes = [...new Set(currentSizeData.map(s => s[fromRegion as Region]))].sort((a,b) => a-b);


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
                    <CardTitle className="font-headline text-2xl">Shoe Size Converter</CardTitle>
                    <CardDescription>Convert shoe sizes between US, UK, Indian, and EU standards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem value="mens" id="mens" className="peer sr-only" />
                                        <Label htmlFor="mens" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Men's</Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="womens" id="womens" className="peer sr-only" />
                                        <Label htmlFor="womens" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Women's</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                         <div className="flex gap-4">
                             <div className="w-1/2 space-y-2">
                                <Label>From</Label>
                                <Controller
                                    name="fromRegion"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="us">US</SelectItem>
                                                <SelectItem value="uk">UK</SelectItem>
                                                <SelectItem value="india">India</SelectItem>
                                                <SelectItem value="eu">EU</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                             </div>
                             <div className="w-1/2 space-y-2">
                                <Label>Size</Label>
                                <Controller
                                    name="fromSize"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {availableSizes.map(size => (
                                                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                             </div>
                         </div>
                    </CardContent>
                </Card>

                {result && (
                  <Card className="w-full bg-primary/5">
                      <CardHeader>
                          <CardTitle className="font-headline">Converted Sizes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <Table>
                              <TableBody>
                                  <TableRow>
                                      <TableCell className="font-medium">US</TableCell>
                                      <TableCell className="text-right text-lg font-bold text-primary">{result.us}</TableCell>
                                  </TableRow>
                                   <TableRow>
                                      <TableCell className="font-medium">UK</TableCell>
                                      <TableCell className="text-right text-lg font-bold text-primary">{result.uk}</TableCell>
                                  </TableRow>
                                   <TableRow>
                                      <TableCell className="font-medium">India</TableCell>
                                      <TableCell className="text-right text-lg font-bold text-primary">{result.india}</TableCell>
                                  </TableRow>
                                   <TableRow>
                                      <TableCell className="font-medium">EU</TableCell>
                                      <TableCell className="text-right text-lg font-bold text-primary">{result.eu}</TableCell>
                                  </TableRow>
                              </TableBody>
                          </Table>
                          <p className="text-xs text-muted-foreground text-center pt-2">Note: Shoe sizes can vary slightly by brand. This is a standard conversion chart.</p>
                      </CardContent>
                  </Card>
                )}
            </div>
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
