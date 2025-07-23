
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
import { Home } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  size: z.enum(['2x2', '3x3']),
  matrix: z.array(z.array(z.coerce.number())),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  determinant: number;
};

export default function MatrixDeterminantCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [matrixSize, setMatrixSize] = useState<2 | 3>(2);

  const { register, handleSubmit, setValue, watch, control } = useForm<FormValues>({
    defaultValues: {
      size: '2x2',
      matrix: [[1, 2], [3, 4]],
    },
  });

  const handleSizeChange = (newSizeValue: string) => {
    const newSize = newSizeValue === '2x2' ? 2 : 3;
    setMatrixSize(newSize);
    setValue('size', newSizeValue as '2x2' | '3x3');
    setValue('matrix', Array(newSize).fill(Array(newSize).fill(0)));
  };

  const onSubmit = (data: FormValues) => {
    const { matrix, size } = data;
    let det = 0;
    if (size === '2x2') {
      det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    } else if (size === '3x3') {
      det = 
          matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1])
        - matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0])
        + matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
    }
    setResult({ determinant: det });
  };

  const matrixGrid = Array.from({ length: matrixSize }, (_, rowIndex) => (
    <div key={rowIndex} className="flex gap-2">
      {Array.from({ length: matrixSize }, (_, colIndex) => (
        <Input
          key={`${rowIndex}-${colIndex}`}
          type="number"
          className="w-20 text-center"
          {...register(`matrix.${rowIndex}.${colIndex}`)}
        />
      ))}
    </div>
  ));

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
                <CardTitle className="font-headline text-2xl">Matrix Determinant Calculator</CardTitle>
                <CardDescription>Calculate the determinant of a 2x2 or 3x3 matrix.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Matrix Size</Label>
                    <RadioGroup
                      defaultValue="2x2"
                      className="flex gap-4"
                      onValueChange={handleSizeChange}
                      value={watch('size')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2x2" id="2x2" />
                        <Label htmlFor="2x2">2x2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3x3" id="3x3" />
                        <Label htmlFor="3x3">3x3</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Matrix Elements</Label>
                    <div className="flex flex-col items-center gap-2 p-4 border rounded-md bg-muted">
                        {matrixGrid}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Determinant</Button>
                </CardFooter>
              </form>
            </Card>

            {result !== null && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p className="text-muted-foreground">The determinant of the matrix is:</p>
                  <div className="text-6xl font-bold text-primary">{result.determinant}</div>
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The determinant of the matrix is ${result.determinant}.`} />
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
                The determinant is a special number that can be calculated from a square matrix. It is useful in solving systems of linear equations, finding the inverse of a matrix, and in calculus.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Formulas Used</h3>
                  <div className="mt-2">
                    <h4 className="font-semibold">For a 2x2 matrix:</h4>
                    <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm">
                        <code>det(A) = ad - bc</code>
                    </pre>
                  </div>
                   <div className="mt-4">
                    <h4 className="font-semibold">For a 3x3 matrix:</h4>
                    <pre className="p-4 mt-2 rounded-md bg-muted font-code text-sm">
                        <code>det(A) = a(ei - fh) - b(di - fg) + c(dh - eg)</code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
