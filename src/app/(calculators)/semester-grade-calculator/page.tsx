
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const courseSchema = z.object({
  name: z.string().optional(),
  credits: z.coerce.number().min(0, 'Credits must be a positive number.'),
  grade: z.coerce.number(),
});

const formSchema = z.object({
  courses: z.array(courseSchema).min(1, 'Please add at least one course.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  gpa: number;
  totalCredits: number;
};

const gradePoints = [
  { label: 'A (4.0)', value: 4.0 },
  { label: 'A- (3.7)', value: 3.7 },
  { label: 'B+ (3.3)', value: 3.3 },
  { label: 'B (3.0)', value: 3.0 },
  { label: 'B- (2.7)', value: 2.7 },
  { label: 'C+ (2.3)', value: 2.3 },
  { label: 'C (2.0)', value: 2.0 },
  { label: 'D (1.0)', value: 1.0 },
  { label: 'F (0.0)', value: 0.0 },
];

export default function SemesterGradeCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courses: [{ name: '', credits: 3, grade: 4.0 }],
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'courses',
  });

  const onSubmit = (data: FormValues) => {
    let totalPoints = 0;
    let totalCredits = 0;

    data.courses.forEach(course => {
      totalPoints += course.credits * course.grade;
      totalCredits += course.credits;
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    setResult({
      gpa,
      totalCredits,
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
                <CardTitle className="font-headline text-2xl">Semester Grade Calculator</CardTitle>
                <CardDescription>Calculate your GPA for the current semester.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Your Courses for the Semester</Label>
                    <p className="text-xs text-muted-foreground">Add each course, its credit value, and the grade you received.</p>
                    <div className="space-y-2 mt-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_80px_120px_auto] items-center gap-2 p-2 border rounded-md">
                          <Input
                            placeholder={`Course ${index + 1} (Optional)`}
                            {...register(`courses.${index}.name`)}
                          />
                          <Input
                            type="number"
                            placeholder="Credits"
                            step="0.5"
                            {...register(`courses.${index}.credits`)}
                          />
                           <Controller
                            control={control}
                            name={`courses.${index}.grade`}
                            render={({ field: { onChange, value } }) => (
                                <Select onValueChange={val => onChange(parseFloat(val))} defaultValue={String(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradePoints.map(gp => (
                                            <SelectItem key={gp.value} value={String(gp.value)}>{gp.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                     {errors.courses && <p className="text-destructive text-sm mt-2">{errors.courses.message || errors.courses.root?.message}</p>}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', credits: 3, grade: 4.0 })}>
                      Add Course
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Semester GPA</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Semester GPA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="text-6xl font-bold text-primary">{result.gpa.toFixed(2)}</div>
                    <p className="text-muted-foreground">Based on {result.totalCredits} total credits this semester.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My GPA for this semester is ${result.gpa.toFixed(2)}!`} />
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">How GPA is Calculated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                GPA, or Grade Point Average, is a standard way of measuring academic achievement. It is calculated by taking the sum of the grade points earned for each course multiplied by the course's credit hours, then dividing that sum by the total number of credit hours taken for the semester.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formula Used</h3>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      GPA = Σ (Grade Point × Credits) / Σ Credits
                    </code>
                  </pre>
                </div>
                <div>
                  <h3 className="font-bold font-headline">FAQs</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What grade point scale is used?</AccordionTrigger>
                      <AccordionContent>
                       This calculator uses a standard 4.0 scale where an 'A' is 4.0 points. The grade points for other letters (like A-, B+, etc.) are also standard values used by many universities.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>How can I calculate my cumulative GPA?</AccordionTrigger>
                      <AccordionContent>
                       To calculate your cumulative GPA, you would need to include all courses and grades from all semesters you have completed, not just the current one.
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
                <p className="font-semibold">Cumulative GPA</p>
              </Link>
              <Link href="/cgpa-to-percentage-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">CGPA to Percentage</p>
              </Link>
              <Link href="/exam-marks-needed-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Exam Marks Needed</p>
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
