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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PixelToEmConverterPage() {
  const form = useForm({
    defaultValues: {
      pixels: '16',
      ems: '1',
      baseSize: '16',
    },
  });

  const { register, setValue, watch, trigger } = form;
  const { pixels, ems, baseSize } = watch();

  // Update EMs when Pixels or Base Size change
  useEffect(() => {
    const px = parseFloat(pixels);
    const base = parseFloat(baseSize);
    if (!isNaN(px) && !isNaN(base) && base > 0) {
      const emValue = px / base;
      setValue('ems', String(parseFloat(emValue.toFixed(4))));
    }
  }, [pixels, baseSize, setValue]);

  // Update Pixels when EMs change
  const handleEmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const emStr = e.target.value;
      setValue('ems', emStr);
      const em = parseFloat(emStr);
      const base = parseFloat(baseSize);
      if (!isNaN(em) && !isNaN(base) && base > 0) {
        const pxValue = em * base;
        setValue('pixels', String(parseFloat(pxValue.toFixed(4))));
      }
  };
  
    // Update Pixels when BaseSize changes while EM is the source of truth
    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const baseStr = e.target.value;
        setValue('baseSize', baseStr);
        const em = parseFloat(ems);
        const base = parseFloat(baseStr);
        if (!isNaN(em) && !isNaN(base) && base > 0) {
            const pxValue = em * base;
            setValue('pixels', String(parseFloat(pxValue.toFixed(4))));
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
            <Card className="shadow-lg w-full">
                <CardHeader>
                <CardTitle className="font-headline text-2xl">Pixel ↔ EM Converter</CardTitle>
                <CardDescription>Convert between pixels and em units for web design.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="pixels">Pixels (px)</Label>
                            <Input id="pixels" type="number" {...register('pixels')} />
                        </div>
                        
                        <div className="self-center pt-8">
                            <ChevronsRight className="size-8 text-muted-foreground"/>
                        </div>

                        <div className="flex-1 space-y-2">
                            <Label htmlFor="ems">EMs</Label>
                            <Input id="ems" type="number" {...register('ems', { onChange: handleEmChange })} />
                        </div>
                    </div>
                     <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="baseSize">Base Size (px)</Label>
                        <Input id="baseSize" type="number" {...register('baseSize', { onChange: handleBaseChange })} />
                        <p className="text-xs text-muted-foreground">This is typically the font-size of the parent element, or the browser default (usually 16px).</p>
                    </div>
                </CardContent>
            </Card>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">How to Use</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        This converter works both ways. Change the pixel value to see the equivalent in ems, or change the em value to see the equivalent in pixels. Adjust the base size to match your project's root font size.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is an `em` unit?</AccordionTrigger>
                            <AccordionContent>
                            The `em` is a scalable unit in CSS. 1em is equal to the current font-size of the element or, if not set, the font-size of its parent. This makes it great for creating scalable and responsive designs.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why is the base size important?</AccordionTrigger>
                            <AccordionContent>
                            The conversion between pixels and ems is entirely dependent on the base font size. A standard browser's default font size is 16px, so if you haven't set a different font size on the body or parent element, 16 is your base.
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
