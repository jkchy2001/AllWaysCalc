
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  Briefcase,
  GraduationCap,
  Shapes,
  Heart,
  HardHat,
  Monitor,
  Leaf,
  Atom,
  HeartPulse,
  Calculator,
  Car,
  Landmark,
  Percent,
  Wallet,
  Home,
  BrainCircuit,
  Sparkles,
  Ruler,
  Baby,
  Droplet,
  BedDouble,
  PersonStanding,
  Timer,
  HeartHandshake,
  Gift,
} from 'lucide-react';
import { CalculatorCard } from '@/components/calculator-card';
import { Header } from '@/components/header';
import Image from 'next/image';

const calculatorCategories = [
  {
    title: 'Finance & Investment',
    description: 'EMI, SIP, Loans, Compound Interest, Investments.',
    icon: <Banknote className="size-8 text-primary" />,
    links: [
      { href: '/loan-calculator', name: 'Loan / EMI Calculator' },
      { href: '/home-loan-calculator', name: 'Home Loan Calculator' },
      { href: '/personal-loan-calculator', name: 'Personal Loan Calculator' },
      { href: '/car-loan-calculator', name: 'Car Loan Calculator' },
      { href: '/business-loan-calculator', name: 'Business Loan Calculator' },
      { href: '/loan-eligibility-calculator', name: 'Loan Eligibility Calculator' },
      { href: '/sip-calculator', name: 'SIP Calculator' },
      { href: '/fd-calculator', name: 'FD Calculator' },
      { href: '/rd-calculator', name: 'RD Calculator' },
      { href: '/ppf-calculator', name: 'PPF Calculator' },
      { href: '/lumpsum-calculator', name: 'Lumpsum Calculator' },
      { href: '/mutual-fund-calculator', name: 'Mutual Fund Calculator' },
      { href: '/tip-calculator', name: 'Tip Calculator' },
      { href: '/compound-interest-calculator', name: 'Compound Interest' },
      { href: '/simple-interest-calculator', name: 'Simple Interest' },
      { href: '/retirement-calculator', name: 'Retirement Calculator' },
      { href: '/inflation-calculator', name: 'Inflation Calculator' },
      { href: '/cagr-calculator', name: 'CAGR Calculator' },
      { href: '/debt-to-income-ratio-calculator', name: 'Debt-to-Income Ratio' },
    ],
  },
  {
    title: 'Business & Tax',
    description: 'GST, Profit Margin, Break-Even, NPV.',
    icon: <Briefcase className="size-8 text-primary" />,
    links: [
      { href: '/gst-calculator', name: 'GST Calculator' },
      { href: '/income-tax-calculator', name: 'Income Tax Calculator' },
      { href: '/hra-calculator', name: 'HRA Calculator' },
      { href: '/gratuity-calculator', name: 'Gratuity Calculator' },
      { href: '/tds-calculator', name: 'TDS Calculator' },
      { href: '/advance-tax-calculator', name: 'Advance Tax Calculator' },
      { href: '/salary-calculator', name: 'Salary (CTC) Calculator' },
      { href: '/discount-calculator', name: 'Discount Calculator' },
      { href: '/profit-margin-calculator', name: 'Profit Margin Calculator' },
      { href: '/markup-calculator', name: 'Markup Calculator' },
      { href: '/break-even-point-calculator', name: 'Break-Even Point Calculator' },
      { href: '/net-profit-calculator', name: 'Net Profit Calculator' },
      { href: '/npv-calculator', name: 'NPV Calculator' },
    ],
  },
  {
    title: 'Education & Student',
    description: 'GPA, CGPA, Percentage, Study Planners.',
    icon: <GraduationCap className="size-8 text-primary" />,
    links: [
      { href: '/percentage-calculator', name: 'Percentage Calculator' },
      { href: '/gpa-calculator', name: 'GPA Calculator' },
      { href: '/cgpa-to-percentage-calculator', name: 'CGPA to Percentage' },
      { href: '/semester-grade-calculator', name: 'Semester Grade Calculator' },
      { href: '/exam-marks-needed-calculator', name: 'Exam Marks Needed' },
      { href: '/attendance-calculator', name: 'Attendance Calculator' },
      { href: '/time-management-calculator', name: 'Time Management Calculator' },
      { href: '/assignment-weight-calculator', name: 'Assignment Weight Calculator' },
      { href: '/memory-retention-calculator', name: 'Memory Retention Calculator' },
    ],
  },
  {
    title: 'Math & Geometry',
    description: 'Percentage Change, Mean, Median, Mode.',
    icon: <Calculator className="size-8 text-primary" />,
    links: [
      { href: '/basic-arithmetic-calculator', name: 'Basic Arithmetic Calculator' },
      { href: '/scientific-calculator', name: 'Scientific Calculator' },
      { href: '/geometry-calculator', name: 'Geometry Calculator' },
      { href: '/trigonometry-calculator', name: 'Trigonometry Calculator' },
      { href: '/percentage-change-calculator', name: 'Percentage Change Calculator' },
      { href: '/quadratic-equation-solver', name: 'Quadratic Equation Solver' },
      { href: '/equation-solver', name: 'Equation Solver' },
      { href: '/matrix-calculator', name: 'Matrix Calculator' },
      { href: '/derivative-calculator', name: 'Derivative Calculator' },
      { href: '/lcm-hcf-calculator', name: 'LCM & HCF Calculator' },
      { href: '/modulo-calculator', name: 'Modulo Calculator' },
      { href: '/mean-median-mode-calculator', name: 'Mean, Median, Mode Calculator' },
      { href: '/permutations-combinations-calculator', name: 'Permutations & Combinations' },
      { href: '/probability-calculator', name: 'Probability Calculator' },
      { href: '/distance-formula-calculator', name: 'Distance Formula Calculator' },
      { href: '/slope-calculator', name: 'Slope Calculator' },
    ],
  },
  {
    title: 'Health & Fitness',
    description: 'BMI, BMR, Calorie Intake, Ideal Weight.',
    icon: <HeartPulse className="size-8 text-primary" />,
    links: [
        { href: '/bmi-calculator', name: 'BMI Calculator' },
        { href: '/bmr-calculator', name: 'BMR Calculator' },
        { href: '/calorie-intake-calculator', name: 'Calorie Intake Calculator' },
        { href: '/ideal-weight-calculator', name: 'Ideal Weight Calculator' },
        { href: '/body-fat-percentage-calculator', name: 'Body Fat Percentage' },
        { href: '/waist-to-height-ratio-calculator', name: 'Waist-to-Height Ratio' },
        { href: '/macronutrient-calculator', name: 'Macronutrient Calculator' },
        { href: '/water-intake-calculator', name: 'Water Intake Calculator' },
        { href: '/heart-rate-calculator', name: 'Heart Rate Calculator' },
        { href: '/steps-to-calories-calculator', name: 'Steps to Calories Calculator' },
    ],
  },
   {
    title: 'Conversions',
    description: 'Length, Mass, Volume, Temperature, Speed.',
    icon: <Ruler className="size-8 text-primary" />,
    links: [
      { href: '/length-converter', name: 'Length Converter' },
      { href: '/mass-converter', name: 'Mass (Weight) Converter' },
      { href: '/temperature-converter', name: 'Temperature Converter' },
      { href: '/volume-converter', name: 'Volume Converter' },
      { href: '/speed-converter', name: 'Speed Converter' },
    ],
  },
  {
    title: 'Life & Personal',
    description: 'Age, Date Duration, Due Date, Tip Jar.',
    icon: <Heart className="size-8 text-primary" />,
    links: [
      { href: '/age-calculator', name: 'Age Calculator' },
      { href: '/date-duration-calculator', name: 'Date Duration Calculator' },
      { href: '/countdown-timer-calculator', name: 'Countdown Timer Calculator'},
      { href: '/pregnancy-due-date-calculator', name: 'Pregnancy Due Date Calculator'},
      { href: '/ovulation-calculator', name: 'Ovulation Calculator' },
      { href: '/sleep-cycle-calculator', name: 'Sleep Cycle Calculator' },
      { href: '/anniversary-calculator', name: 'Anniversary Calculator' },
      { href: '/tip-calculator', name: 'Tip Calculator' },
      { href: '/life-expectancy-calculator', name: 'Life Expectancy Calculator' },
      { href: '/zodiac-sign-calculator', name: 'Zodiac Sign Calculator' },
      { href: '/love-compatibility-calculator', name: 'Love Compatibility Calculator' },
      { href: '/marriage-date-compatibility-calculator', name: 'Marriage Date Compatibility' },
      { href: '/numerology-calculator', name: 'Numerology Calculator' },
      { href: '/baby-name-numerology-calculator', name: 'Baby Name Numerology' },
      { href: '/lucky-number-calculator', name: 'Lucky Number Calculator' },
    ],
  },
  {
    title: 'Construction & Home',
    description: 'Paint, Tile, Concrete, Flooring Costs.',
    icon: <HardHat className="size-8 text-primary" />,
    links: [],
  },
  {
    title: 'Tech & Digital',
    description: 'Download Time, Bandwidth, Subnet, Aspect Ratio.',
    icon: <Monitor className="size-8 text-primary" />,
    links: [],
  },
  {
    title: 'Environment & Agriculture',
    description: 'Carbon Footprint, Solar Panel, Crop Yield.',
    icon: <Leaf className="size-8 text-primary" />,
    links: [],
  },
  {
    title: 'Science',
    description: 'Molar Mass, pH, Ideal Gas Law, Ohm’s Law.',
    icon: <Atom className="size-8 text-primary" />,
    links: [],
  },
];

export default function HomePage() {
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
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Calculator illustration"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-lg"
                  data-ai-hint="abstract geometric calculator"
                />
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
            <div className="mx-auto grid grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {calculatorCategories
                .filter(cat => cat.links.length > 0)
                .map((card) => (
                  <CalculatorCard
                    key={card.title}
                    href={card.links.length > 0 ? card.links[0].href : '#'}
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                    links={card.links}
                  />
              ))}
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
