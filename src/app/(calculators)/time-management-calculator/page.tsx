'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Home, Trash2 } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required.'),
  weight: z.coerce.number().min(1, 'Weight must be at least 1.'),
});

const formSchema = z.object({
  totalHours: z.coerce.number().min(1, 'Total hours must be at least 1.'),
  tasks: z.array(taskSchema).min(1, 'Please add at least one task.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  tasks: {
    name: string;
    allocatedHours: number;
    percentage: number;
  }[];
};

export default function TimeManagementCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalHours: 20,
      tasks: [
        { name: 'Mathematics', weight: 5 },
        { name: 'Physics', weight: 4 },
        { name: 'History', weight: 2 },
      ],
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  const onSubmit = (data: FormValues) => {
    const totalWeight = data.tasks.reduce((sum, task) => sum + task.weight, 0);
    
    const calculatedTasks = data.tasks.map(task => {
      const percentage = (task.weight / totalWeight) * 100;
      const allocatedHours = (data.totalHours * task.weight) / totalWeight;
      return {
        name: task.name,
        allocatedHours,
        percentage,
      };
    });

    setResult({ tasks: calculatedTasks });
  };
  
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

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
                <CardTitle className="font-headline text-2xl">Time Management Calculator</CardTitle>
                <CardDescription>Allocate your study time based on subject priority.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalHours">Total Weekly Study Hours</Label>
                    <Input id="totalHours" type="number" {...register('totalHours')} />
                    {errors.totalHours && <p className="text-destructive text-sm">{errors.totalHours.message}</p>}
                  </div>
                  <div>
                    <Label>Subjects / Tasks and their Importance (Weight)</Label>
                     <p className="text-xs text-muted-foreground">Assign a weight (e.g., 1-5) to each subject based on its difficulty or importance.</p>
                    <div className="space-y-2 mt-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_100px_auto] items-center gap-2">
                          <Input
                            placeholder={`Subject ${index + 1}`}
                            {...register(`tasks.${index}.name`)}
                          />
                          <Input
                            type="number"
                            placeholder="Weight (1-5)"
                            {...register(`tasks.${index}.weight`)}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {errors.tasks && <p className="text-destructive text-sm mt-2">{errors.tasks.root?.message || errors.tasks.message}</p>}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', weight: 3 })}>
                      Add Subject
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Generate Schedule</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Recommended Study Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-right">Time Allocation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {result.tasks.map((task, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="font-medium">{task.name}</div>
                                        <div className="text-xs text-muted-foreground">{task.percentage.toFixed(1)}% of total time</div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatHours(task.allocatedHours)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My generated study plan helps me manage my time effectively.`} />
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
               This calculator helps you create a balanced study schedule by distributing your available time across different subjects based on their importance or "weight". A higher weight means more time will be allocated to that subject.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Methodology</h3>
                  <p>The total weight of all subjects is calculated. Then, the percentage of time for each subject is determined by its share of the total weight. This percentage is then applied to your total weekly study hours to get a recommended time allocation for each subject.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What should I use for "weight"?</AccordionTrigger>
                      <AccordionContent>
                       The weight is a personal value you assign. You could use course credits, difficulty level, or simply how important the subject is to you. A simple 1-5 scale (where 5 is most important/difficult) is a good starting point.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Is this a rigid schedule?</AccordionTrigger>
                      <AccordionContent>
                       No. Think of this as a guideline. It's a tool to help you see how your priorities translate into time on a weekly basis. You can adjust it to fit your daily energy levels and specific deadlines.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Calculators</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/gpa-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">GPA Calculator</p>
              </Link>
              <Link href="/semester-grade-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Semester Grade</p>
              </Link>
              <Link href="/memory-retention-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Memory Retention</p>
              </Link>
              <Link href="/attendance-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Attendance Calculator</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
