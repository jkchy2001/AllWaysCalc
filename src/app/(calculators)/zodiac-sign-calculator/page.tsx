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
import { Home, Sparkles, HeartHandshake, Users, Gem, Star } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const zodiacSigns = [
    { name: 'Aries', start: '03-21', end: '04-19', symbol: '♈', traits: 'Ambitious, Independent, Impatient' },
    { name: 'Taurus', start: '04-20', end: '05-20', symbol: '♉', traits: 'Dependable, Musical, Stubborn' },
    { name: 'Gemini', start: '05-21', end: '06-20', symbol: '♊', traits: 'Curious, Adaptable, Indecisive' },
    { name: 'Cancer', start: '06-21', end: '07-22', symbol: '♋', traits: 'Emotional, Imaginative, Moody' },
    { name: 'Leo', start: '07-23', end: '08-22', symbol: '♌', traits: 'Creative, Passionate, Arrogant' },
    { name: 'Virgo', start: '08-23', end: '09-22', symbol: '♍', traits: 'Loyal, Analytical, Overly Critical' },
    { name: 'Libra', start: '09-23', end: '10-22', symbol: '♎', traits: 'Social, Fair-minded, Indecisive' },
    { name: 'Scorpio', start: '10-23', end: '11-21', symbol: '♏', traits: 'Passionate, Brave, Jealous' },
    { name: 'Sagittarius', start: '11-22', end: '12-21', symbol: '♐', traits: 'Generous, Idealistic, Promises more than can deliver' },
    { name: 'Capricorn', start: '12-22', end: '01-19', symbol: '♑', traits: 'Responsible, Disciplined, Unforgiving' },
    { name: 'Aquarius', start: '01-20', end: '02-18', symbol: '♒', traits: 'Progressive, Original, Aloof' },
    { name: 'Pisces', start: '02-19', end: '03-20', symbol: '♓', traits: 'Compassionate, Artistic, Fearful' },
];

type ZodiacSign = typeof zodiacSigns[0];

const getZodiacSign = (date: Date): ZodiacSign | null => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Handle Capricorn edge case across year-end
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return zodiacSigns.find(s => s.name === 'Capricorn');
    }

    for (const sign of zodiacSigns) {
        if (sign.name === 'Capricorn') continue;
        
        const [startMonth, startDay] = sign.start.split('-').map(Number);
        const [endMonth, endDay] = sign.end.split('-').map(Number);

        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
            return sign;
        }
    }
    return null; // Should not happen with current logic
}

export default function ZodiacSignCalculatorPage() {
  const [result, setResult] = useState<ZodiacSign | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const birthDate = new Date(data.birthDate);
    const sign = getZodiacSign(birthDate);
    setResult(sign);
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
                            <CardTitle className="font-headline text-2xl">Western Zodiac Sign Calculator</CardTitle>
                            <CardDescription>Discover your astrological sun sign based on your date of birth.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">Your Date of Birth</Label>
                                    <p className="text-xs text-muted-foreground">Enter the date you were born on.</p>
                                    <Input id="birthDate" type="date" {...register('birthDate')} />
                                    {errors.birthDate && <p className="text-destructive text-sm">{errors.birthDate.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">Find My Sign</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                       <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="font-headline text-center">Your Zodiac Sign</CardTitle>
                                <CardDescription className="text-center">Based on the tropical zodiac.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <div className="text-6xl mx-auto">{result.symbol}</div>
                                <div className="text-4xl font-bold text-primary">{result.name}</div>
                                <div className="text-muted-foreground">{result.traits}</div>
                            </CardContent>
                            <CardFooter>
                                <SharePanel resultText={`I'm a ${result.name}! Find your zodiac sign.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8 w-full bg-card/50 border-border/50 backdrop-blur-sm">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Zodiac Signs</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        Western astrology is based on the 12 zodiac signs, each corresponding to a specific period of the year. Your sign is determined by the position of the sun in the zodiac at the time of your birth.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>Is this the same as my Chinese zodiac sign?</AccordionTrigger>
                              <AccordionContent>
                               No, this is based on Western astrology. The Chinese zodiac is based on a 12-year cycle, with each year represented by an animal.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What about the 13th sign, Ophiuchus?</AccordionTrigger>
                              <AccordionContent>
                               Ophiuchus is a constellation, but it is not part of the traditional tropical zodiac used by most Western astrologers. This calculator uses the 12 traditional signs.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger>Disclaimer</AccordionTrigger>
                              <AccordionContent>
                               Astrology is a belief system and is not based on scientific evidence. This calculator is provided for entertainment purposes only.
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
                    <Link href="/love-compatibility-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                       <HeartHandshake className="mx-auto mb-2 size-6" />
                      <p className="font-semibold">Love Compatibility</p>
                    </Link>
                    <Link href="/numerology-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                       <Star className="mx-auto mb-2 size-6" />
                      <p className="font-semibold">Numerology Calculator</p>
                    </Link>
                     <Link href="/marriage-date-compatibility-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                       <Users className="mx-auto mb-2 size-6" />
                      <p className="font-semibold">Marriage Compatibility</p>
                    </Link>
                     <Link href="/lucky-number-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                       <Gem className="mx-auto mb-2 size-6" />
                      <p className="font-semibold">Lucky Number</p>
                    </Link>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
