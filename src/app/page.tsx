import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  HeartPulse,
  FlaskConical,
  ShoppingBag,
  Sun,
} from 'lucide-react';
import { CalculatorCard } from '@/components/calculator-card';
import { Header } from '@/components/header';

const calculatorCategories = [
  {
    href: '/tip-calculator',
    title: 'Financial',
    description: 'Calculate loans, investments, and more.',
    icon: <Calculator className="size-8 text-primary" />,
  },
  {
    href: '/tip-calculator',
    title: 'Health & Fitness',
    description: 'Track calories, BMI, and fitness goals.',
    icon: <HeartPulse className="size-8 text-primary" />,
  },
  {
    href: '/tip-calculator',
    title: 'Math & Science',
    description: 'Solve complex equations and conversions.',
    icon: <FlaskConical className="size-8 text-primary" />,
  },
  {
    href: '/tip-calculator',
    title: 'Everyday Life',
    description: 'Utilities for daily tasks and planning.',
    icon: <ShoppingBag className="size-8 text-primary" />,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    AllWaysCalc: Your Go-To Calculation Hub
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    From simple tips to complex financial models, AllWaysCalc
                    provides the tools you need with clarity and precision.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <Sun className="h-32 w-32 text-primary/20 animate-spin [animation-duration:20s]" />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Calculators for Every Occasion
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore our comprehensive suite of calculators, designed for
                  accuracy and ease of use.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
              {calculatorCategories.map((card) => (
                <CalculatorCard
                  key={card.title}
                  href={card.href}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>
            <div className="flex justify-center">
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                See all calculators <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-6 px-4 md:px-6 border-t bg-background">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} AllWaysCalc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
