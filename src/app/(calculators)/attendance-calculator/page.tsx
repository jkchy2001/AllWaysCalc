
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
import { Home } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  totalClasses: z.coerce.number().int().min(1, "Total classes must be at least 1."),
  missedClasses: z.coerce.number().int().min(0, "Missed classes cannot be negative."),
  requiredPercentage: z.coerce.number().min(0, "Required percentage must be positive.").max(100, "Percentage cannot exceed 100."),
}).refine(data => data.missedClasses <= data.totalClasses, {
    message: "Missed classes cannot be more than total classes.",
    path: ["missedClasses"],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    currentPercentage: number;
    attendedClasses: number;
    maxMissableClasses: number;
    canMissMore: number;
    status: 'safe' | 'danger' | 'critical';
};

export default function AttendanceCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalClasses: undefined,
      missedClasses: undefined,
      requiredPercentage: 75,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { totalClasses, missedClasses, requiredPercentage } = data;
    
    const attendedClasses = totalClasses - missedClasses;
    const currentPercentage = (attendedClasses / totalClasses) * 100;
    
    const maxMissableClasses = Math.floor(totalClasses * (1 - requiredPercentage / 100));
    const canMissMore = maxMissableClasses - missedClasses;
    
    let status: 'safe' | 'danger' | 'critical';
    if (canMissMore < 0) {
        status = 'danger';
    } else if (canMissMore <= totalClasses * 0.05) { // If can miss less than 5% of total classes
        status = 'critical';
    } else {
        status = 'safe';
    }

    setResult({
        currentPercentage,
        attendedClasses,
        maxMissableClasses,
        canMissMore,
        status,
    });
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Attendance Calculator</CardTitle>
                            <CardDescription>Track your attendance and see how many classes you can miss.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totalClasses">Total Number of Classes</Label>
                                    <Input id="totalClasses" type="number" placeholder="e.g., 80" {...register('totalClasses')} />
                                    {errors.totalClasses && <p className="text-destructive text-sm">{errors.totalClasses.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="missedClasses">Classes Missed So Far</Label>
                                    <Input id="missedClasses" type="number" placeholder="e.g., 5" {...register('missedClasses')} />
                                    {errors.missedClasses && <p className="text-destructive text-sm">{errors.missedClasses.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="requiredPercentage">Required Attendance (%)</Label>
                                    <Input id="requiredPercentage" type="number" placeholder="e.g., 75" {...register('requiredPercentage')} />
                                    {errors.requiredPercentage && <p className="text-destructive text-sm">{errors.requiredPercentage.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Status</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className={`w-full ${
                            result.status === 'danger' ? 'bg-destructive/10 border-destructive' :
                            result.status === 'critical' ? 'bg-amber-400/10 border-amber-500' :
                            'bg-primary/5'
                        }`}>
                            <CardHeader>
                                <CardTitle className="font-headline">Your Attendance Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                {result.status === 'danger' ? (
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-destructive">You're in the red!</p>
                                        <p className="text-muted-foreground">You have missed {Math.abs(result.canMissMore)} more class(es) than allowed.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-4xl font-bold text-primary">{result.canMissMore}</div>
                                        <p className="text-muted-foreground">more class(es) you can miss.</p>
                                    </>
                                )}
                                <div className="space-y-2 text-sm text-muted-foreground pt-4 border-t">
                                    <div className="flex justify-between">
                                        <span>Current Attendance:</span>
                                        <span className="font-medium text-foreground">{result.currentPercentage.toFixed(2)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Classes Attended:</span>
                                        <span className="font-medium text-foreground">{result.attendedClasses} / {form.getValues('totalClasses')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Max Permitted Absences:</span>
                                        <span className="font-medium text-foreground">{result.maxMissableClasses}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={`My attendance is ${result.currentPercentage.toFixed(2)}% and I can miss ${result.canMissMore} more classes.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        This calculator helps you stay on top of your attendance requirements. By knowing exactly how many classes you can afford to miss, you can make informed decisions and avoid falling below the minimum percentage required by your school or university.
                      </p>
                      <div className="space-y-4">
                      <div>
                          <h3 className="font-bold font-headline">Formula Used</h3>
                          <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                          <code>
                              Max Missable = floor(Total Classes * (1 - Required % / 100))<br/>
                              Remaining = Max Missable - Already Missed
                          </code>
                          </pre>
                      </div>
                      <div>
                          <h3 className="font-bold font-headline">FAQs</h3>
                          <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger>What does the status color mean?</AccordionTrigger>
                              <AccordionContent>
                                <b>Green (Safe):</b> You have a comfortable buffer of classes you can miss.<br/>
                                <b>Amber (Critical):</b> You are close to the limit. Be careful not to miss any more classes unnecessarily.<br/>
                                <b>Red (Danger):</b> You have already missed more classes than allowed. You may need to speak with your instructor.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>What if I have more classes in the future?</AccordionTrigger>
                              <AccordionContent>
                              The "Total Number of Classes" should be the total for the entire course or semester. The calculator works by figuring out the total number of absences you're allowed for the whole term.
                              </AccordionContent>
                          </AccordionItem>
                          </Accordion>
                      </div>
                      </div>
                  </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
