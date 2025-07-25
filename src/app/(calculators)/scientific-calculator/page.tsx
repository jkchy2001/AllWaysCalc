'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Parser } from 'expr-eval';

// Factorial function
const factorial = (n: number): number => {
  if (n < 0) return NaN; // Factorial is not defined for negative numbers
  if (n === 0) return 1;
  return n * factorial(n - 1);
};


export default function ScientificCalculatorPage() {
  const [expression, setExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0');

  const handleInput = (char: string) => {
    if (displayValue === 'Error') {
      setExpression(char);
      setDisplayValue(char);
    } else if (displayValue === '0' && !'./()'.includes(char)) {
       setExpression(char);
       setDisplayValue(char);
    }
    else {
       setExpression(prev => prev + char);
       setDisplayValue(prev => prev + char);
    }
  };

  const handleFunction = (func: string) => {
    if (displayValue === 'Error') {
        setExpression(func + '(');
        setDisplayValue(func + '(');
    } else {
        setExpression(prev => prev + func + '(');
        setDisplayValue(prev => prev + func + '(');
    }
  }

  const clearAll = () => {
    setExpression('');
    setDisplayValue('0');
  };
  
  const backspace = () => {
    if(displayValue === 'Error' || displayValue === '0') return;
    setExpression(prev => prev.slice(0, -1));
    setDisplayValue(prev => {
        const newValue = prev.slice(0, -1);
        return newValue === '' ? '0' : newValue;
    });
  }

  const handleEquals = () => {
    try {
        if (!expression) return;
        
        // Define custom functions for the parser
        const parser = new Parser();
        parser.functions.fact = factorial;

        // Replace π and e with their values for evaluation
        const evalExpression = expression.replace(/π/g, 'pi').replace(/e/g, 'E');

        let result = parser.evaluate(evalExpression);
        
        // Cap the length of the result string
        const resultString = String(result).slice(0, 15);
        
        setDisplayValue(resultString);
        setExpression(resultString);

    } catch (error) {
        setDisplayValue('Error');
        setExpression('');
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Scientific Calculator</CardTitle>
              <CardDescription>An advanced calculator for scientific calculations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted text-right rounded-lg p-4 mb-4 text-3xl font-mono break-all h-20 flex items-center justify-end">
                {displayValue}
              </div>
              <div className="grid grid-cols-5 gap-2">
                <Button variant="outline" className="text-lg py-7" onClick={() => handleFunction('sin')}>sin</Button>
                <Button variant="outline" className="text-lg py-7" onClick={() => handleFunction('cos')}>cos</Button>
                <Button variant="outline" className="text-lg py-7" onClick={() => handleFunction('tan')}>tan</Button>
                <Button variant="outline" className="text-lg py-7" onClick={() => handleInput('^')}>x^y</Button>
                <Button variant="destructive" className="text-lg py-7" onClick={backspace}>DEL</Button>

                <Button variant="outline" className="text-lg py-7" onClick={() => handleFunction('log')}>log</Button>
                <Button variant="outline" className="text-lg py-7" onClick={() => handleFunction('ln')}>ln</Button>
                <Button variant="outline" className="text-lg py-7" onClick={() => handleInput('(')}>(</Button>
                <Button variant="outline" className="text-lg py-7" onClick={() => handleInput(')')}>)</Button>
                <Button variant="destructive" className="text-lg py-7" onClick={clearAll}>AC</Button>
                
                <Button variant="outline" className="text-lg py-7" onClick={() => handleFunction('sqrt')}>√</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('7')}>7</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('8')}>8</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('9')}>9</Button>
                <Button variant="outline" className="text-lg py-7 bg-accent/20" onClick={() => handleInput('/')}>÷</Button>

                <Button variant="outline" className="text-lg py-7" onClick={() => handleFunction('fact')}>n!</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('4')}>4</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('5')}>5</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('6')}>6</Button>
                <Button variant="outline" className="text-lg py-7 bg-accent/20" onClick={() => handleInput('*')}>×</Button>

                <Button variant="outline" className="text-lg py-7" onClick={() => handleInput('π')}>π</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('1')}>1</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('2')}>2</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('3')}>3</Button>
                <Button variant="outline" className="text-lg py-7 bg-accent/20" onClick={() => handleInput('-')}>-</Button>

                <Button variant="outline" className="text-lg py-7" onClick={() => handleInput('e')}>e</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('0')}>0</Button>
                <Button variant="secondary" className="text-lg py-7" onClick={() => handleInput('.')}>.</Button>
                <Button className="text-lg py-7 bg-accent hover:bg-accent/90" onClick={handleEquals}>=</Button>
                <Button variant="outline" className="text-lg py-7 bg-accent/20" onClick={() => handleInput('+')}>+</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
