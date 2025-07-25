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

const assignmentSchema = z.object({
  name: z.string().optional(),
  score: z.coerce.number().min(0, 'Score must be positive.'),
  total: z.coerce.number().min(0.01, 'Total must be greater than 0.'),
  weight: z.coerce.number().min(0, 'Weight must be positive.').max(100, 'Weight cannot exceed 100.'),
}).refine(data => data.score <= data.total, {
    message: "Score cannot be greater than total possible points.",
    path: ["score"],
});

const formSchema = z.object({
  assignments: z.array(assignmentSchema).min(1, 'Please add at least one assignment.'),
}).refine(data => {
    const totalWeight = data.assignments.reduce((sum, a) => sum + a.weight, 0);
    return totalWeight <= 100;
}, {
    message: 'The sum of all assignment weights cannot exceed 100%.',
    path: ['assignments'],
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  currentGrade: number;
  totalWeight: number;
};

export default function AssignmentWeightCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignments: [
        { name: 'Homework 1', score: 90, total: 100, weight: 10 },
        { name: 'Quiz 1', score: 8, total: 10, weight: 15 },
        { name: 'Midterm', score: 85, total: 100, weight: 25 },
      ],
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assignments',
  });

  const onSubmit = (data: FormValues) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    data.assignments.forEach(assignment => {
      const percentageScore = (assignment.score / assignment.total);
      totalWeightedScore += percentageScore * assignment.weight;
      totalWeight += assignment.weight;
    });

    const currentGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    
    setResult({
      currentGrade,
      totalWeight,
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
                <CardTitle className="font-headline text-2xl">Course Grade &amp; Assignment Weight Calculator</CardTitle>
                <CardDescription>Calculate your current weighted grade in a course by entering your assignment scores and their respective weights.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Your Assignments</Label>
                    <p className="text-xs text-muted-foreground">Enter your score, the total possible score, and the weight (%) each assignment contributes to your final grade.</p>
                    <div className="space-y-2 mt-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_80px_80px_80px_auto] items-center gap-2 p-2 border rounded-md">
                          <Input
                            placeholder={`Assignment ${index + 1}`}
                            {...register(`assignments.${index}.name`)}
                          />
                          <Input
                            type="number"
                            placeholder="Score"
                            {...register(`assignments.${index}.score`)}
                          />
                           <Input
                            type="number"
                            placeholder="Out of"
                            {...register(`assignments.${index}.total`)}
                          />
                           <Input
                            type="number"
                            placeholder="Weight %"
                            {...register(`assignments.${index}.weight`)}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                     {errors.assignments && <p className="text-destructive text-sm mt-2">{errors.assignments.root?.message || errors.assignments.message}</p>}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', score: 0, total: 100, weight: 10 })}>
                      Add Assignment
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Current Grade</Button>
                </CardFooter>
              </form>
            </Card>

            {result && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Your Current Grade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="text-6xl font-bold text-primary">{result.currentGrade.toFixed(2)}%</div>
                    <p className="text-muted-foreground">Based on {result.totalWeight}% of your total grade completed.</p>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`My current grade is ${result.currentGrade.toFixed(2)}%!`} />
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
                This calculator helps you track your academic progress by calculating your current weighted grade in a course. By entering your scores and how much each assignment is worth, you can see your standing before the final exam.
              </p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Formula Used</AccordionTrigger>
                  <AccordionContent>
                   <p>The calculator follows these steps:</p>
                   <ol className="list-decimal list-inside my-2 space-y-1">
                      <li>For each assignment, it calculates the percentage score: `(Your Score / Total Possible Score)`.</li>
                      <li>This percentage score is then multiplied by the assignment's weight to find its contribution to the final grade.</li>
                      <li>The contributions of all assignments are summed up.</li>
                      <li>This sum is divided by the sum of all entered weights to find your current weighted average.</li>
                   </ol>
                   <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm overflow-x-auto">
                    <code>
                      Weighted Score = (Score / Total Points) * Weight<br/>
                      Current Grade = (Σ Weighted Scores / Σ Weights) * 100
                    </code>
                  </pre>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>FAQs</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">What does "Weight" mean?</h4>
                        <p>The weight is how much the assignment contributes to your final grade. For example, if a midterm is worth 25% of your final grade, its weight is 25. The total weight of all assignments in your syllabus should add up to 100.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Can I use this to see what I need on my final?</h4>
                        <p>This calculator shows your current grade based on completed work. To figure out what you need on the final, you can use our "Exam Marks Needed" calculator!</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">What if I don't know the weights?</h4>
                        <p>If your professor doesn't provide weights, you might be on a points-based system. In that case, you can use the "Total Possible Score" as the weight for each assignment to get a simple unweighted average.</p>
                      </div>
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
              <Link href="/exam-marks-needed-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Exam Marks Needed</p>
              </Link>
              <Link href="/gpa-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">GPA Calculator</p>
              </Link>
              <Link href="/semester-grade-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                <p className="font-semibold">Semester Grade</p>
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
