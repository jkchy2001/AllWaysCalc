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
import { Home, Crop, ArrowLeftRight } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function AspectRatioCalculatorPage() {
  const [activeInput, setActiveInput] = useState<'w2' | 'h2' | null>(null);
  
  const form = useForm({
    defaultValues: {
      w1: '1920',
      h1: '1080',
      w2: '1280',
      h2: '720',
    },
  });

  const { register, setValue, watch, trigger } = form;
  const { w1, h1, w2, h2 } = watch();

  useEffect(() => {
    const width1 = parseFloat(w1);
    const height1 = parseFloat(h1);
    const width2 = parseFloat(w2);
    const height2 = parseFloat(h2);

    if (isNaN(width1) || isNaN(height1) || width1 <= 0 || height1 <= 0) {
      return;
    }

    if (activeInput === 'w2' && !isNaN(width2)) {
      const newHeight = (height1 / width1) * width2;
      setValue('h2', String(parseFloat(newHeight.toFixed(2))));
    } else if (activeInput === 'h2' && !isNaN(height2)) {
      const newWidth = (width1 / height1) * height2;
      setValue('w2', String(parseFloat(newWidth.toFixed(2))));
    } else if (activeInput === null && !isNaN(width2)) { // Initial load or w1/h1 change
       const newHeight = (height1 / width1) * width2;
       setValue('h2', String(parseFloat(newHeight.toFixed(2))));
    }

  }, [w1, h1, w2, h2, setValue, activeInput]);
  

  return (
    <div className="flex flex-col min-h-screen">
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
                    <CardTitle className="font-headline text-2xl">Aspect Ratio Calculator</CardTitle>
                    <CardDescription>Calculate new dimensions while maintaining aspect ratio for images or videos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="p-4 border rounded-md space-y-4">
                            <h3 className="font-semibold text-sm">Original Dimensions (W:H)</h3>
                             <p className="text-xs text-muted-foreground">Enter the original width and height of your media.</p>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="w1">Width 1</Label>
                                    <Input id="w1" type="number" {...register('w1')} onFocus={() => setActiveInput(null)}/>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="h1">Height 1</Label>
                                    <Input id="h1" type="number" {...register('h1')} onFocus={() => setActiveInput(null)} />
                                </div>
                            </div>
                        </div>

                         <div className="p-4 border rounded-md space-y-4">
                            <h3 className="font-semibold text-sm">New Dimensions</h3>
                             <p className="text-xs text-muted-foreground">Change one value, and the other will be calculated automatically.</p>
                             <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="w2">Width 2</Label>
                                    <Input id="w2" type="number" {...register('w2')} onFocus={() => setActiveInput('w2')} />
                                </div>
                                 <div className="self-center pt-8 text-muted-foreground">
                                    <ArrowLeftRight className="size-5"/>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="h2">Height 2</Label>
                                    <Input id="h2" type="number" {...register('h2')} onFocus={() => setActiveInput('h2')} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full bg-primary/5">
                    <CardHeader>
                        <CardTitle className="font-headline text-center">Result</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <Crop className="mx-auto size-16 text-primary" />
                        <p className="text-muted-foreground">The aspect ratio is</p>
                        <p className="text-3xl font-bold text-primary">{w1}:{h1}</p>
                        <p className="text-muted-foreground">Your new dimensions are</p>
                        <p className="text-3xl font-bold text-primary">{w2} x {h2}</p>
                    </CardContent>
                    <CardFooter>
                         <SharePanel resultText={`My resized dimensions are ${w2} x ${h2} to maintain a ${w1}:${h1} aspect ratio.`} />
                    </CardFooter>
                </Card>
            </div>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Understanding Aspect Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                       Aspect ratio describes the proportional relationship between an image's width and its height. It's commonly expressed as two numbers separated by a colon, like 16:9 for widescreen TVs. This calculator helps you resize an image or video to new dimensions while keeping the original aspect ratio intact, preventing distortion.
                    </p>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How is it calculated?</AccordionTrigger>
                            <AccordionContent>
                                The calculation is based on a simple cross-multiplication formula. If you know the original width (W1) and height (H1), and you want to find a new height (H2) for a given new width (W2), the formula is: <br /> <br />
                                <code className="p-2 bg-muted rounded-md">H2 = (H1 / W1) * W2</code> <br /><br />
                                Conversely, to find a new width (W2) for a given new height (H2), the formula is: <br /> <br />
                                <code className="p-2 bg-muted rounded-md">W2 = (W1 / H1) * H2</code>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What are common aspect ratios?</AccordionTrigger>
                            <AccordionContent>
                                <ul className="list-disc pl-5">
                                    <li><b>16:9</b> - Standard for widescreen TVs, monitors, and most online videos (e.g., YouTube).</li>
                                    <li><b>4:3</b> - Traditional TV and computer monitor standard.</li>
                                    <li><b>3:2</b> - Common in photography, used by many DSLR and mirrorless cameras.</li>
                                    <li><b>1:1</b> - A square, popular on social media platforms like Instagram.</li>
                                    <li><b>9:16</b> - Vertical video, common for social media stories (e.g., Instagram Reels, TikTok).</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Why is maintaining aspect ratio important?</AccordionTrigger>
                            <AccordionContent>
                            If you resize an image or video without maintaining its aspect ratio, the content will appear stretched or squashed, leading to a distorted and unprofessional look. This tool ensures that your content scales correctly.
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
              <Link href="/screen-resolution-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Screen Resolution (PPI)</p>
              </Link>
              <Link href="/pixel-to-em-converter" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Pixel to EM Converter</p>
              </Link>
              <Link href="/file-size-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">File Size Calculator</p>
              </Link>
               <Link href="/bitrate-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Bitrate Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
