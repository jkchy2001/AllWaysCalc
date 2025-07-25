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
import { Home, TestTube, FlaskConical, Atom } from 'lucide-react';
import { SharePanel } from '@/components/share-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const formSchema = z.object({
  formula: z.string().min(1, 'Please enter a chemical formula.'),
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
  molarMass: number;
  error?: string;
};

// Standard atomic weights
const ATOMIC_WEIGHTS: { [key: string]: number } = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
  Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
  Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
  Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.96, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
  Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24,
  Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05,
  Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
  Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03,
};

const calculateMolarMass = (formula: string): { mass: number, error?: string } => {
    // This is a simplified parser. It may not handle all complex cases.
    const tokens = formula.match(/([A-Z][a-z]*)(\d*)|(\()|(\))(\d*)/g);
    if (!tokens) return { mass: 0, error: 'Invalid formula format.' };

    const stack: (number | string)[] = [0];

    for (const token of tokens) {
        if (token === '(') {
            stack.push(0);
        } else if (token.startsWith(')')) {
            const groupMultiplier = parseInt(token.substring(1) || '1', 10);
            const groupMass = stack.pop() as number;
            (stack[stack.length - 1] as number) += groupMass * groupMultiplier;
        } else {
            const match = token.match(/([A-Z][a-z]*)(\d*)/);
            if (match) {
                const [, element, countStr] = match;
                const count = parseInt(countStr || '1', 10);
                const atomicWeight = ATOMIC_WEIGHTS[element];
                if (!atomicWeight) {
                    return { mass: 0, error: `Unknown element: ${element}` };
                }
                (stack[stack.length - 1] as number) += atomicWeight * count;
            }
        }
    }

    if (stack.length !== 1 || typeof stack[0] !== 'number') {
        return { mass: 0, error: 'Mismatched parentheses.' };
    }

    return { mass: stack[0] };
};

export default function MolarMassCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formula: 'H2O',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    const { mass, error } = calculateMolarMass(data.formula);
    if (error) {
      setResult({ molarMass: 0, error });
    } else {
      setResult({ molarMass: mass });
    }
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
                            <CardTitle className="font-headline text-2xl">Molar Mass Calculator</CardTitle>
                            <CardDescription>Calculate the molar mass of a chemical compound by entering its formula.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="formula">Chemical Formula</Label>
                                    <p className="text-xs text-muted-foreground">Use standard chemical notation. For example: `H2O`, `C6H12O6`, `Ca(OH)2`.</p>
                                    <Input id="formula" placeholder="e.g., H2O or C6H12O6" {...register('formula')} />
                                    {errors.formula && <p className="text-destructive text-sm">{errors.formula.message}</p>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Calculate Molar Mass</Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {result && (
                        <Card className="w-full bg-primary/5">
                            <CardHeader>
                                <CardTitle className="font-headline">Result</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <TestTube className="mx-auto size-12 text-primary" />
                                {result.error ? (
                                    <p className="text-destructive font-semibold">{result.error}</p>
                                ) : (
                                    <>
                                        <p className="text-muted-foreground">The molar mass is:</p>
                                        <div className="text-4xl font-bold text-primary">
                                            {result.molarMass.toFixed(4)}
                                        </div>
                                        <p className="text-lg text-muted-foreground">g/mol</p>
                                    </>
                                )}
                            </CardContent>
                             <CardFooter>
                                <SharePanel resultText={result.error ? `Error calculating molar mass.` : `The molar mass of ${form.getValues('formula')} is ${result.molarMass.toFixed(4)} g/mol.`} />
                            </CardFooter>
                        </Card>
                    )}
                </div>
                <Card className="mt-8">
                  <CardHeader>
                      <CardTitle className="font-headline">Understanding Molar Mass</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="mb-4">
                        Molar mass is a physical property defined as the mass of a given substance (chemical element or chemical compound) divided by the amount of substance, measured in moles. It connects the macroscopic world of mass (grams) with the microscopic world of atoms and molecules.
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                         <AccordionItem value="item-1">
                              <AccordionTrigger>How It Works</AccordionTrigger>
                              <AccordionContent>
                                <p>
                                    This calculator parses the chemical formula you enter. It identifies each element and counts the number of atoms (including those inside parentheses). It then multiplies the atom count of each element by its standard atomic weight (sourced from IUPAC) and sums up these values to get the total molar mass in grams per mole (g/mol).
                                </p>
                                <h4 className='font-semibold mt-4'>Examples:</h4>
                                <ul className="list-disc list-inside text-sm mt-2 space-y-1 bg-muted p-4 rounded-md">
                                    <li>`H2O`: 2 * (1.008) + 1 * (15.999) = 18.015 g/mol</li>
                                    <li>`C6H12O6`: 6 * (12.011) + 12 * (1.008) + 6 * (15.999) = 180.156 g/mol</li>
                                    <li>`Ca(OH)2`: 1 * (40.078) + 2 * (15.999 + 1.008) = 74.092 g/mol</li>
                                </ul>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger>FAQs</AccordionTrigger>
                              <AccordionContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">What is a mole?</h4>
                                    <p>A mole is a unit of measurement for the amount of a substance. One mole contains Avogadro's number (approximately 6.022 x 10²³) of particles (atoms, molecules, etc.). The molar mass is the mass of one mole of a substance.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Why is molar mass important?</h4>
                                    <p>It's a fundamental concept in stoichiometry, allowing chemists to convert between the mass of a substance and the number of moles, which is essential for balancing chemical equations and predicting the outcomes of reactions.</p>
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
                        <Link href="/ph-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <TestTube className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">pH Calculator</p>
                        </Link>
                        <Link href="/ideal-gas-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <FlaskConical className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Ideal Gas Law</p>
                        </Link>
                         <Link href="/density-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <Home className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Density Calculator</p>
                        </Link>
                        <Link href="/newtons-law-calculator" className="bg-muted hover:bg-muted/50 p-4 rounded-lg text-center">
                            <Atom className="mx-auto mb-2 size-6" />
                            <p className="font-semibold">Newton's Second Law</p>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
