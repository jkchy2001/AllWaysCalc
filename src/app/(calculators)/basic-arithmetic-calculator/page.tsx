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
import { motion } from 'framer-motion';

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
      if (displayValue === '0' && digit === '0') return;
      if (displayValue.length >= 15) return;
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
      const resultString = String(result);
      setDisplayValue(resultString.slice(0, 15));
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
        if (secondOperand === 0) return NaN; // Handle division by zero
        result = firstOperand / secondOperand;
        break;
      default:
        return secondOperand;
    }
    return result;
  };
  
  const handleEquals = () => {
    if (!operator) return;

    const result = performCalculation();
    const resultString = isNaN(result) ? 'Error' : String(result);
    
    setDisplayValue(resultString.slice(0, 15));
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
  
  const toggleSign = () => {
    setDisplayValue(String(parseFloat(displayValue) * -1));
  };

  const inputPercent = () => {
    const currentValue = parseFloat(displayValue);
    if (firstOperand !== null && operator) {
      const percentValue = (firstOperand * currentValue) / 100;
      setDisplayValue(String(percentValue));
    } else {
      setDisplayValue(String(currentValue / 100));
    }
  };
  
  const buttonClass = "h-16 w-16 text-2xl rounded-full shadow-lg transition-all duration-150 transform hover:scale-105 active:scale-95";
  const numberButtonClass = "bg-secondary/70 text-secondary-foreground hover:bg-secondary";
  const operatorButtonClass = "bg-primary text-primary-foreground hover:bg-primary/90";
  const functionButtonClass = "bg-muted/70 text-muted-foreground hover:bg-muted";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <div className="mb-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
              <Home className="size-4" /> Home
            </Link>
          </div>
          <Card className="shadow-2xl bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-60 border border-border/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-center">Basic Arithmetic Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-foreground/10 text-right rounded-lg p-4 mb-6 text-5xl font-mono break-all h-24 flex items-center justify-end shadow-inner text-primary [text-shadow:0_0_8px_hsl(var(--primary))]">
                {displayValue}
              </div>
              <div className="grid grid-cols-4 gap-3">
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${functionButtonClass}`} onClick={clearAll}>AC</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${functionButtonClass}`} onClick={toggleSign}>+/-</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${functionButtonClass}`} onClick={inputPercent}>%</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${operatorButtonClass}`} onClick={() => handleOperator('/')}>÷</Button></motion.div>

                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('7')}>7</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('8')}>8</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('9')}>9</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${operatorButtonClass}`} onClick={() => handleOperator('*')}>×</Button></motion.div>

                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('4')}>4</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('5')}>5</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('6')}>6</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${operatorButtonClass}`} onClick={() => handleOperator('-')}>-</Button></motion.div>

                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('1')}>1</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('2')}>2</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={() => inputDigit('3')}>3</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${operatorButtonClass}`} onClick={() => handleOperator('+')}>+</Button></motion.div>
                
                <motion.div whileTap={{ scale: 0.9 }} className="col-span-2"><Button variant="ghost" className={`h-16 w-full text-2xl rounded-full shadow-lg transition-all duration-150 transform hover:scale-105 active:scale-95 ${numberButtonClass}`} onClick={() => inputDigit('0')}>0</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button variant="ghost" className={`${buttonClass} ${numberButtonClass}`} onClick={inputDecimal}>.</Button></motion.div>
                <motion.div whileTap={{ scale: 0.9 }}><Button className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`} onClick={handleEquals}>=</Button></motion.div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
