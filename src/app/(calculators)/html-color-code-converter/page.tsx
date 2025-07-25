'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Home, Palette } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// --- Color Conversion Utilities ---
const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const rgbToHsl = (r: number, g: number, b: number): { h: number, s: number, l: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number): { r: number, g: number, b: number } => {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; }
    else if (h >= 60 && h < 120) { r = x; g = c; }
    else if (h >= 120 && h < 180) { g = c; b = x; }
    else if (h >= 180 && h < 240) { g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; b = c; }
    else if (h >= 300 && h < 360) { r = c; b = x; }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
};

export default function ColorConverterPage() {
    const [color, setColor] = useState("#348feb");

    const form = useForm({
        values: {
            hex: "#348FEB",
            r: 52, g: 143, b: 235,
            h: 212, s: 85, l: 56,
        }
    });

    const { register, setValue, watch } = form;

    const updateFromHex = useCallback((hex: string) => {
        const rgb = hexToRgb(hex);
        if (rgb) {
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            setValue('r', rgb.r);
            setValue('g', rgb.g);
            setValue('b', rgb.b);
            setValue('h', hsl.h);
            setValue('s', hsl.s);
            setValue('l', hsl.l);
            setColor(hex);
        }
    }, [setValue]);

    const updateFromRgb = useCallback(() => {
        const { r, g, b } = watch();
        const hex = rgbToHex(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        setValue('hex', hex);
        setValue('h', hsl.h);
        setValue('s', hsl.s);
        setValue('l', hsl.l);
        setColor(hex);
    }, [watch, setValue]);

    const updateFromHsl = useCallback(() => {
        const { h, s, l } = watch();
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        setValue('hex', hex);
        setValue('r', rgb.r);
        setValue('g', rgb.g);
        setValue('b', rgb.b);
        setColor(hex);
    }, [watch, setValue]);


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
            <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
                <Card className="shadow-lg">
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl">HTML Color Code Converter</CardTitle>
                    <CardDescription>Convert between HEX, RGB, and HSL color values.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="hex">HEX</Label>
                            <Input {...register('hex')} onChange={e => updateFromHex(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>RGB (Red, Green, Blue)</Label>
                            <div className="flex gap-2">
                                <Input type="number" min="0" max="255" {...register('r')} onChange={updateFromRgb} />
                                <Input type="number" min="0" max="255" {...register('g')} onChange={updateFromRgb} />
                                <Input type="number" min="0" max="255" {...register('b')} onChange={updateFromRgb} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>HSL (Hue, Saturation, Lightness)</Label>
                            <div className="flex gap-2">
                                <Input type="number" min="0" max="360" {...register('h')} onChange={updateFromHsl} />
                                <Input type="number" min="0" max="100" {...register('s')} onChange={updateFromHsl} />
                                <Input type="number" min="0" max="100" {...register('l')} onChange={updateFromHsl} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="w-full bg-primary/5">
                        <CardHeader>
                            <CardTitle className="font-headline text-center">Color Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center gap-4">
                           <div className="relative">
                               <div className="w-48 h-48 rounded-full border-8 border-background shadow-lg" style={{ backgroundColor: color }} />
                               <input 
                                  type="color" 
                                  value={color}
                                  onChange={(e) => updateFromHex(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                           </div>
                           <p className="font-mono text-lg text-primary">{watch('hex')}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Understanding Color Codes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                       This converter allows you to translate colors between the most common color models used in web design and development.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>HEX (Hexadecimal)</AccordionTrigger>
                            <AccordionContent>
                                HEX codes are a six-digit combination of letters and numbers that represent the mix of Red, Green, and Blue. For example, `#FF0000` is pure red.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>RGB (Red, Green, Blue)</AccordionTrigger>
                            <AccordionContent>
                                The RGB model specifies colors using values for Red, Green, and Blue, each ranging from 0 to 255. For example, `rgb(255, 0, 0)` is pure red.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>HSL (Hue, Saturation, Lightness)</AccordionTrigger>
                            <AccordionContent>
                                HSL represents color in a more human-friendly way. Hue is the color's position on a color wheel (0-360), Saturation is its intensity (0-100%), and Lightness is its brightness (0-100%).
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
