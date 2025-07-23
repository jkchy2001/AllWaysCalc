
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Home, BrainCircuit } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { addDays, format } from 'date-fns';

const formSchema = z.object({
  topic: z.string().min(1, 'Topic name is required.'),
  initialUnderstanding: z.number().min(1).max(5),
  reviews: z.coerce.number().int().min(0, 'Number of reviews must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  nextReviewDate: string;
  retentionStrength: number;
};

export default function MemoryRetentionCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      initialUnderstanding: 3,
      reviews: 0,
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { initialUnderstanding, reviews } = data;
    
    // Base forgetting rate (in days) is influenced by initial understanding
    const baseInterval = Math.pow(initialUnderstanding, 1.5); // e.g., 1->1, 3->5.2, 5->11.2
    
    // Each review strengthens the memory, increasing the interval (a simplified model)
    // The factor 1.8 is a common multiplier in spaced repetition systems
    const nextIntervalDays = baseInterval * Math.pow(1.8, reviews);

    const nextReviewDate = addDays(new Date(), Math.round(nextIntervalDays));
    
    // Retention strength is a percentage based on how long the next interval is
    // This is a heuristic value to give the user some feedback
    const retentionStrength = Math.min(100, (nextIntervalDays / 90) * 100);

    setResult({
      nextReviewDate: format(nextReviewDate, 'MMMM d, yyyy'),
      retentionStrength: Math.round(retentionStrength),
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
                <CardTitle className="font-headline text-2xl">Memory Retention Calculator</CardTitle>
                <CardDescription>Estimate the best time to review what you've learned.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic / Subject</Label>
                    <Input id="topic" placeholder="e.g., Photosynthesis" {...register('topic')} />
                    {errors.topic && <p className="text-destructive text-sm">{errors.topic.message}</p>}
                  </div>
                  <Controller
                    name="initialUnderstanding"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>How well did you learn it initially? ({field.value})</Label>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                         <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Barely</span>
                            <span>So-so</span>
                            <span>Perfectly</span>
                        </div>
                      </div>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="reviews">Number of times reviewed since</Label>
                    <Input id="reviews" type="number" {...register('reviews')} />
                    {errors.reviews && <p className="text-destructive text-sm">{errors.reviews.message}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Review Date</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Study Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">Recommended next review date:</p>
                    <div className="text-4xl font-bold text-primary">{result.nextReviewDate}</div>
                    <div className="pt-4">
                        <Label>Retention Strength: {result.retentionStrength}%</Label>
                        <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${result.retentionStrength}%` }}></div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`I should review "${form.getValues('topic')}" around ${result.nextReviewDate} to improve my memory retention!`} />
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
               This calculator is based on the principles of **spaced repetition** and the **Ebbinghaus forgetting curve**. It estimates when you are likely to start forgetting information so you can review it at the optimal moment to build strong, long-lasting memories.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <p>The calculator generates a future review date based on your initial understanding and the number of times you've already reviewed the material. Each successful review pushes the next review date further into the future, helping you study more efficiently.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is the forgetting curve?</AccordionTrigger>
                      <AccordionContent>
                       The forgetting curve is a psychological model that shows how memories are lost over time when there is no attempt to retain them. The curve is initially very steep, meaning you forget things quickly after learning them, but it flattens out with each review.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Why is this better than cramming?</AccordionTrigger>
                      <AccordionContent>
                       Cramming puts information into your short-term memory, but it's quickly forgotten. Spaced repetition strengthens the neural pathways for a memory, moving it from short-term to long-term storage. It's far more effective for durable learning.
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
