
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

export default function BasicArithmeticCalculatorPage() {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
        setDisplayValue('0.');
        setWaitingForSecondOperand(false);
        return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation();
      setDisplayValue(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = (): number => {
    if (firstOperand === null || operator === null) return parseFloat(displayValue);
    
    const secondOperand = parseFloat(displayValue);
    let result = 0;

    switch (operator) {
      case '+':
        result = firstOperand + secondOperand;
        break;
      case '-':
        result = firstOperand - secondOperand;
        break;
      case '*':
        result = firstOperand * secondOperand;
        break;
      case '/':
        result = firstOperand / secondOperand;
        break;
    }
    return result;
  };
  
  const handleEquals = () => {
    const result = performCalculation();
    setDisplayValue(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  }

  const clearAll = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Basic Arithmetic Calculator</CardTitle>
              <CardDescription>Your everyday calculator.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted text-right rounded-lg p-4 mb-4 text-4xl font-mono break-all">
                {displayValue}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="col-span-2 text-xl py-8" onClick={clearAll}>AC</Button>
                <Button variant="outline" className="text-xl py-8" onClick={() => handleOperator('/')}>÷</Button>
                <Button variant="outline" className="text-xl py-8" onClick={() => handleOperator('*')}>×</Button>

                <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('7')}>7</Button>
                <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('8')}>8</Button>
                <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('9')}>9</Button>
                <Button variant="outline" className="text-xl py-8" onClick={() => handleOperator('-')}>-</Button>

                <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('4')}>4</Button>
                <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('5')}>5</Button>
                <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('6')}>6</Button>
                <Button variant="outline" className="text-xl py-8" onClick={() => handleOperator('+')}>+</Button>

                <div className="grid grid-cols-1 gap-2 row-span-2">
                    <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('1')}>1</Button>
                    <Button variant="secondary" className="text-xl py-8 col-start-1" onClick={() => inputDigit('0')}>0</Button>
                </div>
                 <div className="grid grid-cols-1 gap-2 row-span-2">
                    <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('2')}>2</Button>
                    <Button variant="secondary" className="text-xl py-8" onClick={inputDecimal}>.</Button>
                </div>
                 <div className="grid grid-cols-1 gap-2 row-span-2">
                    <Button variant="secondary" className="text-xl py-8" onClick={() => inputDigit('3')}>3</Button>
                    <Button className="text-xl py-8 bg-accent hover:bg-accent/90" onClick={handleEquals}>=</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
