
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  operation: z.enum(['determinant', 'add', 'subtract', 'multiply', 'transpose']),
  size: z.enum(['2x2', '3x3']),
  matrixA: z.array(z.array(z.coerce.number())),
  matrixB: z.array(z.array(z.coerce.number())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  determinant?: number;
  resultMatrix?: number[][];
  operation: 'determinant' | 'add' | 'subtract' | 'multiply' | 'transpose';
  error?: string;
};

const getInitialMatrix = (size: 2 | 3) => {
    if (size === 2) return [[1, 2], [3, 4]];
    return [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
};

export default function MatrixCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [matrixSize, setMatrixSize] = useState<2 | 3>(2);

  const form = useForm<FormValues>({
    defaultValues: {
      operation: 'determinant',
      size: '2x2',
      matrixA: getInitialMatrix(2),
      matrixB: getInitialMatrix(2),
    },
  });

  const { register, handleSubmit, setValue, watch } = form;

  const operation = watch('operation');
  const size = watch('size');

  const handleSizeChange = (newSizeValue: string) => {
    const newSize = newSizeValue === '2x2' ? 2 : 3;
    setMatrixSize(newSize);
    setValue('size', newSizeValue as '2x2' | '3x3');
    setValue('matrixA', getInitialMatrix(newSize));
    setValue('matrixB', getInitialMatrix(newSize));
  };
  
  const handleOperationChange = (newOperation: string) => {
      setValue('operation', newOperation as any);
      setResult(null);
  }

  const onSubmit = (data: FormValues) => {
    const { matrixA, matrixB, size, operation } = data;
    setResult(null); // Clear previous results

    try {
        if (operation === 'determinant') {
            let det = 0;
            if (size === '2x2') {
              det = matrixA[0][0] * matrixA[1][1] - matrixA[0][1] * matrixA[1][0];
            } else if (size === '3x3') {
              det = 
                  matrixA[0][0] * (matrixA[1][1] * matrixA[2][2] - matrixA[1][2] * matrixA[2][1])
                - matrixA[0][1] * (matrixA[1][0] * matrixA[2][2] - matrixA[1][2] * matrixA[2][0])
                + matrixA[0][2] * (matrixA[1][0] * matrixA[2][1] - matrixA[1][1] * matrixA[2][0]);
            }
            setResult({ determinant: det, operation });
        } else if (operation === 'transpose') {
            const resultMatrix: number[][] = Array.from({length: matrixA[0].length}, () => []);
            for (let i = 0; i < matrixA.length; i++) {
                for(let j = 0; j < matrixA[i].length; j++) {
                    resultMatrix[j][i] = matrixA[i][j];
                }
            }
            setResult({ resultMatrix, operation });
        }
        else if (matrixB) {
            const resultMatrix: number[][] = [];
            for (let i = 0; i < matrixA.length; i++) {
                resultMatrix[i] = [];
                for (let j = 0; j < matrixA[i].length; j++) {
                    if(operation === 'add') resultMatrix[i][j] = matrixA[i][j] + matrixB[i][j];
                    if(operation === 'subtract') resultMatrix[i][j] = matrixA[i][j] - matrixB[i][j];
                }
            }

            if(operation === 'multiply') {
                for (let i = 0; i < matrixA.length; i++) {
                    resultMatrix[i] = [];
                    for (let j = 0; j < matrixB[0].length; j++) {
                        let sum = 0;
                        for (let k = 0; k < matrixA[0].length; k++) {
                            sum += matrixA[i][k] * matrixB[k][j];
                        }
                        resultMatrix[i][j] = sum;
                    }
                }
            }
            setResult({ resultMatrix, operation });
        }
    } catch(e) {
        setResult({ operation, error: 'An error occurred during calculation.'})
    }
  };

  const MatrixGrid = ({ matrixName }: { matrixName: 'matrixA' | 'matrixB' }) => (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-md bg-muted">
        {Array.from({ length: matrixSize }, (_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
            {Array.from({ length: matrixSize }, (_, colIndex) => (
                <Input
                key={`${rowIndex}-${colIndex}`}
                type="number"
                className="w-20 text-center"
                {...register(`${matrixName}.${rowIndex}.${colIndex}`)}
                />
            ))}
            </div>
        ))}
    </div>
  );

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
                <CardTitle className="font-headline text-2xl">Matrix Calculator</CardTitle>
                <CardDescription>Perform matrix operations like determinant, addition, etc.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operation</Label>
                     <Select onValueChange={handleOperationChange} defaultValue={operation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Operation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="determinant">Determinant</SelectItem>
                          <SelectItem value="add">Addition</SelectItem>
                          <SelectItem value="subtract">Subtraction</SelectItem>
                          <SelectItem value="multiply">Multiplication</SelectItem>
                          <SelectItem value="transpose">Transpose</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Matrix Size</Label>
                    <RadioGroup
                      defaultValue="2x2"
                      className="flex gap-4"
                      onValueChange={handleSizeChange}
                      value={size}
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
                    <Label>Matrix A</Label>
                    <MatrixGrid matrixName="matrixA" />
                  </div>
                  {(operation === 'add' || operation === 'subtract' || operation === 'multiply') && (
                     <div className="space-y-2">
                        <Label>Matrix B</Label>
                        <MatrixGrid matrixName="matrixB" />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate</Button>
                </CardFooter>
              </form>
            </Card>

            {result !== null && (
              <Card className="w-full bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-headline">Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  {result.error && <p className="text-destructive">{result.error}</p>}
                  {result.operation === 'determinant' && result.determinant !== undefined && (
                    <>
                      <p className="text-muted-foreground">The determinant of the matrix is:</p>
                      <div className="text-6xl font-bold text-primary">{result.determinant}</div>
                    </>
                  )}
                  {result.resultMatrix && (
                     <>
                      <p className="text-muted-foreground">The resulting matrix is:</p>
                      <div className="flex justify-center">
                          <div className="flex flex-col items-center gap-2 p-4 border rounded-md bg-muted">
                              {result.resultMatrix.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex gap-2">
                                    {row.map((cell, colIndex) => (
                                    <Input
                                        key={`${rowIndex}-${colIndex}`}
                                        type="number"
                                        className="w-20 text-center"
                                        value={cell}
                                        readOnly
                                    />
                                    ))}
                                </div>
                             ))}
                          </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <SharePanel resultText={`The matrix calculation result is ready.`} />
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
                This calculator performs several common matrix operations. Matrices are arrays of numbers arranged in rows and columns, fundamental to linear algebra and many scientific fields.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold font-headline">Operations</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Determinant</AccordionTrigger>
                      <AccordionContent>
                        The determinant is a special scalar value that can be computed from a square matrix. For a 2x2 matrix, it is `ad - bc`. For a 3x3 matrix, the calculation is more complex.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                      <AccordionTrigger>Addition & Subtraction</AccordionTrigger>
                      <AccordionContent>
                       These operations are performed element-wise. For two matrices A and B of the same dimensions, the resulting matrix C is calculated as C[i,j] = A[i,j] ± B[i,j].
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Multiplication</AccordionTrigger>
                        <AccordionContent>
                        Matrix multiplication involves taking the dot product of the rows of the first matrix with the columns of the second matrix.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Transpose</AccordionTrigger>
                        <AccordionContent>
                        The transpose of a matrix is found by flipping the matrix over its main diagonal, switching the row and column indices.
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
