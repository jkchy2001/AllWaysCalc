
'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowRight,
  Banknote,
  Briefcase,
  GraduationCap,
  Shapes,
  Heart,
  Construction,
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
  Layers,
  TrendingUp,
  Layers3,
  PaintBucket,
  WalletCards,
  DownloadCloud,
  Signal,
  Network,
  Scaling,
  Crop,
  Building,
  PiggyBank,
  TrendingDown,
  LineChart,
  FunctionSquare,
  BookOpen,
  ClipboardCheck,
  Calculator as CalculatorIcon,
  Pi,
  Sigma,
  Minus,
  Shuffle,
  Binary,
  Scale,
  Bone,
  Flame,
  Activity,
  UserCheck,
  Dumbbell,
  BarChart,
  Target,
  FileText,
  FileMinus,
  FilePlus,
  Coins,
  Receipt,
  CandlestickChart,
  Building2,
  CalendarDays,
  PercentCircle,
  BookMarked,
  Book,
  FileClock,
  Notebook,
  GraduationCap as GraduationCapIcon,
  TestTube,
  FlaskConical,
  Beaker,
  TestTubes,
  Footprints,
  Clock,
  CalendarHeart,
  CalendarClock,
  Users,
  Moon,
  Star,
  Gem,
  Palette,
  ClipboardList,
  Thermometer,
  Gauge,
  FileDigit,
  SquareTerminal,
  Droplets,
  Sun,
  Recycle,
  Zap,
  Box,
  CreditCard,
  Plane,
  Luggage,
  Fuel,
  Cog,
  Bolt,
  RotateCw,
  BatteryCharging,
} from 'lucide-react';
import { CalculatorCard } from '@/components/calculator-card';
import { Header } from '@/components/header';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimatedHero } from '@/components/animated-hero';

const calculatorCategories = [
  {
    title: 'Finance & Investment',
    description: 'EMI, SIP, Loans, Compound Interest, Investments.',
    icon: <Banknote className="size-8 text-primary" />,
    links: [
      { href: '/loan-calculator', name: 'Loan / EMI Calculator', icon: <Landmark className="size-4" /> },
      { href: '/home-loan-calculator', name: 'Home Loan Calculator', icon: <Home className="size-4" /> },
      { href: '/personal-loan-calculator', name: 'Personal Loan Calculator', icon: <WalletCards className="size-4" /> },
      { href: '/car-loan-calculator', name: 'Car Loan Calculator', icon: <Car className="size-4" /> },
      { href: '/business-loan-calculator', name: 'Business Loan Calculator', icon: <Briefcase className="size-4" /> },
      { href: '/loan-eligibility-calculator', name: 'Loan Eligibility Calculator', icon: <UserCheck className="size-4" /> },
      { href: '/sip-calculator', name: 'SIP Calculator', icon: <TrendingUp className="size-4" /> },
      { href: '/fd-calculator', name: 'FD Calculator', icon: <PiggyBank className="size-4" /> },
      { href: '/rd-calculator', name: 'RD Calculator', icon: <CalendarClock className="size-4" /> },
      { href: '/ppf-calculator', name: 'PPF Calculator', icon: <Building2 className="size-4" /> },
      { href: '/lumpsum-calculator', name: 'Lumpsum Calculator', icon: <Wallet className="size-4" /> },
      { href: '/mutual-fund-calculator', name: 'Mutual Fund Calculator', icon: <CandlestickChart className="size-4" /> },
      { href: '/tip-calculator', name: 'Tip Calculator', icon: <Receipt className="size-4" /> },
      { href: '/compound-interest-calculator', name: 'Compound Interest', icon: <LineChart className="size-4" /> },
      { href: '/simple-interest-calculator', name: 'Simple Interest', icon: <Coins className="size-4" /> },
      { href: '/retirement-calculator', name: 'Retirement Calculator', icon: <PersonStanding className="size-4" /> },
      { href: '/inflation-calculator', name: 'Inflation Calculator', icon: <TrendingDown className="size-4" /> },
      { href: '/cagr-calculator', name: 'CAGR Calculator', icon: <BarChart className="size-4" /> },
      { href: '/debt-to-income-ratio-calculator', name: 'Debt-to-Income Ratio', icon: <FileText className="size-4" /> },
    ],
  },
  {
    title: 'Business & Tax',
    description: 'GST, Profit Margin, Break-Even, NPV.',
    icon: <Briefcase className="size-8 text-primary" />,
    links: [
      { href: '/gst-calculator', name: 'GST Calculator', icon: <FilePlus className="size-4" /> },
      { href: '/income-tax-calculator', name: 'Income Tax Calculator', icon: <FileText className="size-4" /> },
      { href: '/hra-calculator', name: 'HRA Calculator', icon: <Home className="size-4" /> },
      { href: '/gratuity-calculator', name: 'Gratuity Calculator', icon: <WalletCards className="size-4" /> },
      { href: '/tds-calculator', name: 'TDS Calculator', icon: <FileMinus className="size-4" /> },
      { href: '/advance-tax-calculator', name: 'Advance Tax Calculator', icon: <CalendarDays className="size-4" /> },
      { href: '/salary-calculator', name: 'Salary (CTC) Calculator', icon: <Wallet className="size-4" /> },
      { href: '/discount-calculator', name: 'Discount Calculator', icon: <Percent className="size-4" /> },
      { href: '/profit-margin-calculator', name: 'Profit Margin Calculator', icon: <PercentCircle className="size-4" /> },
      { href: '/markup-calculator', name: 'Markup Calculator', icon: <TrendingUp className="size-4" /> },
      { href: '/break-even-point-calculator', name: 'Break-Even Point Calculator', icon: <Target className="size-4" /> },
      { href: '/net-profit-calculator', name: 'Net Profit Calculator', icon: <LineChart className="size-4" /> },
      { href: '/npv-calculator', name: 'NPV Calculator', icon: <CandlestickChart className="size-4" /> },
      { href: '/tds-late-fee-calculator', name: 'TDS Late Fee/Penalty Calculator', icon: <FileMinus className="size-4" /> },
    ],
  },
  {
    title: 'Banking & Credit Calculators',
    description: 'Credit card interest, overdrafts, and more.',
    icon: <CreditCard className="size-8 text-primary" />,
    links: [
      { href: '/credit-card-interest-calculator', name: 'Credit Card Interest Calculator', icon: <CreditCard className="size-4" /> },
      { href: '/overdraft-interest-calculator', name: 'Overdraft Interest Calculator', icon: <TrendingDown className="size-4" /> },
      { href: '/prepayment-vs-tenure-reduction-calculator', name: 'Prepayment vs Tenure Reduction', icon: <FileMinus className="size-4" /> },
      { href: '/balance-transfer-benefit-calculator', name: 'Balance Transfer Benefit', icon: <Shuffle className="size-4" /> },
      { href: '/emi-in-arrears-vs-advance-calculator', name: 'EMI in Arrears vs Advance', icon: <CalendarClock className="size-4" /> },
      { href: '/credit-score-impact-simulator', name: 'Credit Score Impact Simulator', icon: <BarChart className="size-4" /> },
      { href: '/mortgage-refinance-calculator', name: 'Mortgage Refinance Calculator', icon: <Home className="size-4" /> },
    ],
  },
  {
    title: 'Education & Student',
    description: 'GPA, CGPA, Percentage, Study Planners.',
    icon: <GraduationCap className="size-8 text-primary" />,
    links: [
      { href: '/percentage-calculator', name: 'Percentage Calculator', icon: <Percent className="size-4" /> },
      { href: '/gpa-calculator', name: 'GPA Calculator', icon: <GraduationCapIcon className="size-4" /> },
      { href: '/cgpa-to-percentage-calculator', name: 'CGPA to Percentage', icon: <Scaling className="size-4" /> },
      { href: '/semester-grade-calculator', name: 'Semester Grade Calculator', icon: <BookOpen className="size-4" /> },
      { href: '/exam-marks-needed-calculator', name: 'Exam Marks Needed', icon: <Target className="size-4" /> },
      { href: '/attendance-calculator', name: 'Attendance Calculator', icon: <ClipboardCheck className="size-4" /> },
      { href: '/time-management-calculator', name: 'Time Management Calculator', icon: <Notebook className="size-4" /> },
      { href: '/assignment-weight-calculator', name: 'Assignment Weight Calculator', icon: <BookMarked className="size-4" /> },
      { href: '/memory-retention-calculator', name: 'Memory Retention Calculator', icon: <BrainCircuit className="size-4" /> },
    ],
  },
  {
    title: 'Math & Geometry',
    description: 'Percentage Change, Mean, Median, Mode.',
    icon: <Calculator className="size-8 text-primary" />,
    links: [
      { href: '/basic-arithmetic-calculator', name: 'Basic Arithmetic Calculator', icon: <CalculatorIcon className="size-4" /> },
      { href: '/scientific-calculator', name: 'Scientific Calculator', icon: <FlaskConical className="size-4" /> },
      { href: '/geometry-calculator', name: 'Geometry Calculator', icon: <Shapes className="size-4" /> },
      { href: '/trigonometry-calculator', name: 'Trigonometry Calculator', icon: <Pi className="size-4" /> },
      { href: '/percentage-change-calculator', name: 'Percentage Change Calculator', icon: <LineChart className="size-4" /> },
      { href: '/quadratic-equation-solver', name: 'Quadratic Equation Solver', icon: <FunctionSquare className="size-4" /> },
      { href: '/equation-solver', name: 'Equation Solver', icon: <Sigma className="size-4" /> },
      { href: '/matrix-calculator', name: 'Matrix Calculator', icon: <Minus className="size-4" /> },
      { href: '/derivative-calculator', name: 'Derivative Calculator', icon: <FunctionSquare className="size-4" /> },
      { href: '/lcm-hcf-calculator', name: 'LCM & HCF Calculator', icon: <Book className="size-4" /> },
      { href: '/modulo-calculator', name: 'Modulo Calculator', icon: <Percent className="size-4" /> },
      { href: '/mean-median-mode-calculator', name: 'Mean, Median, Mode Calculator', icon: <BarChart className="size-4" /> },
      { href: '/permutations-combinations-calculator', name: 'Permutations & Combinations', icon: <Shuffle className="size-4" /> },
      { href: '/probability-calculator', name: 'Probability Calculator', icon: <TestTubes className="size-4" /> },
      { href: '/distance-formula-calculator', name: 'Distance Formula Calculator', icon: <Scaling className="size-4" /> },
      { href: '/slope-calculator', name: 'Slope Calculator', icon: <TrendingUp className="size-4" /> },
      { href: '/speed-distance-time-calculator', name: 'Speed, Distance, Time', icon: <Gauge className="size-4" /> },
    ],
  },
  {
    title: 'Health & Fitness',
    description: 'BMI, BMR, Calorie Intake, Ideal Weight.',
    icon: <HeartPulse className="size-8 text-primary" />,
    links: [
        { href: '/bmi-calculator', name: 'BMI Calculator', icon: <UserCheck className="size-4" /> },
        { href: '/bmr-calculator', name: 'BMR Calculator', icon: <Flame className="size-4" /> },
        { href: '/calorie-intake-calculator', name: 'Calorie Intake Calculator', icon: <Droplet className="size-4" /> },
        { href: '/ideal-weight-calculator', name: 'Ideal Weight Calculator', icon: <PersonStanding className="size-4" /> },
        { href: '/body-fat-percentage-calculator', name: 'Body Fat Percentage', icon: <Bone className="size-4" /> },
        { href: '/waist-to-height-ratio-calculator', name: 'Waist-to-Height Ratio', icon: <Ruler className="size-4" /> },
        { href: '/waist-to-hip-ratio-calculator', name: 'Waist-to-Hip Ratio', icon: <Ruler className="size-4" /> },
        { href: '/macronutrient-calculator', name: 'Macronutrient Calculator', icon: <Dumbbell className="size-4" /> },
        { href: '/water-intake-calculator', name: 'Water Intake Calculator', icon: <Droplet className="size-4" /> },
        { href: '/heart-rate-calculator', name: 'Heart Rate Calculator', icon: <Activity className="size-4" /> },
        { href: '/steps-to-calories-calculator', name: 'Steps to Calories Calculator', icon: <Footprints className="size-4" /> },
    ],
  },
   {
    title: 'Conversions',
    description: 'Length, Mass, Volume, Temperature, Speed.',
    icon: <Ruler className="size-8 text-primary" />,
    links: [
      { href: '/length-converter', name: 'Length Converter', icon: <Ruler className="size-4" /> },
      { href: '/mass-converter', name: 'Mass (Weight) Converter', icon: <Scale className="size-4" /> },
      { href: '/temperature-converter', name: 'Temperature Converter', icon: <Thermometer className="size-4" /> },
      { href: '/volume-converter', name: 'Volume Converter', icon: <Beaker className="size-4" /> },
      { href: '/speed-converter', name: 'Speed Converter', icon: <Gauge className="size-4" /> },
      { href: '/shoe-size-converter', name: 'Shoe Size Converter', icon: <Footprints className="size-4" /> },
      { href: '/html-color-code-converter', name: 'HTML Color Code Converter', icon: <Palette className="size-4" /> },
      { href: '/pixel-to-em-converter', name: 'Pixel to EM Converter', icon: <Scaling className="size-4" /> },
    ],
  },
  {
    title: 'Life & Personal',
    description: 'Age, Date Duration, Due Date, Tip Jar.',
    icon: <Heart className="size-8 text-primary" />,
    links: [
      { href: '/age-calculator', name: 'Age Calculator', icon: <CalendarClock className="size-4" /> },
      { href: '/date-duration-calculator', name: 'Date Duration Calculator', icon: <CalendarDays className="size-4" /> },
      { href: '/countdown-timer-calculator', name: 'Countdown Timer Calculator', icon: <Timer className="size-4" /> },
      { href: '/pregnancy-due-date-calculator', name: 'Pregnancy Due Date Calculator', icon: <Baby className="size-4" /> },
      { href: '/ovulation-calculator', name: 'Ovulation Calculator', icon: <CalendarHeart className="size-4" /> },
      { href: '/sleep-cycle-calculator', name: 'Sleep Cycle Calculator', icon: <BedDouble className="size-4" /> },
      { href: '/anniversary-calculator', name: 'Anniversary Calculator', icon: <Gift className="size-4" /> },
      { href: '/life-expectancy-calculator', name: 'Life Expectancy Calculator', icon: <HeartPulse className="size-4" /> },
      { href: '/zodiac-sign-calculator', name: 'Zodiac Sign Calculator', icon: <Sparkles className="size-4" /> },
      { href: '/love-compatibility-calculator', name: 'Love Compatibility Calculator', icon: <HeartHandshake className="size-4" /> },
      { href: '/marriage-date-compatibility-calculator', name: 'Marriage Date Compatibility', icon: <Users className="size-4" /> },
      { href: '/numerology-calculator', name: 'Numerology Calculator', icon: <Star className="size-4" /> },
      { href: '/baby-name-numerology-calculator', name: 'Baby Name Numerology', icon: <Gem className="size-4" /> },
      { href: '/lucky-number-calculator', name: 'Lucky Number Calculator', icon: <Sparkles className="size-4" /> },
    ],
  },
  {
    title: 'Construction & Home',
    description: 'Paint, Tile, Concrete, Flooring Costs.',
    icon: <Construction className="size-8 text-primary" />,
    links: [
      { href: '/paint-calculator', name: 'Paint Calculator', icon: <PaintBucket className="size-4" /> },
      { href: '/tile-calculator', name: 'Tile Calculator', icon: <Layers className="size-4" /> },
      { href: '/brick-calculator', name: 'Brick Calculator', icon: <Landmark className="size-4" /> },
      { href: '/concrete-calculator', name: 'Concrete Calculator', icon: <Layers3 className="size-4" /> },
      { href: '/plaster-calculator', name: 'Plaster Calculator', icon: <ClipboardList className="size-4" /> },
      { href: '/roof-area-calculator', name: 'Roof Area Calculator', icon: <Home className="size-4" /> },
      { href: '/stair-calculator', name: 'Stair Calculator', icon: <TrendingUp className="size-4" /> },
      { href: '/wallpaper-calculator', name: 'Wallpaper Calculator', icon: <Palette className="size-4" /> },
      { href: '/flooring-cost-calculator', name: 'Flooring Cost Calculator', icon: <Wallet className="size-4" /> },
    ],
  },
  {
    title: 'Tech & Digital',
    description: 'Download Time, Bandwidth, Subnet, Aspect Ratio.',
    icon: <Monitor className="size-8 text-primary" />,
    links: [
        { href: '/download-time-calculator', name: 'Download Time Calculator', icon: <DownloadCloud className="size-4" /> },
        { href: '/bandwidth-calculator', name: 'Bandwidth Calculator', icon: <Signal className="size-4" /> },
        { href: '/bitrate-calculator', name: 'Bitrate Calculator', icon: <Binary className="size-4" /> },
        { href: '/file-size-calculator', name: 'File Size Calculator', icon: <FileDigit className="size-4" /> },
        { href: '/ip-subnet-calculator', name: 'IP Subnet Calculator', icon: <Network className="size-4" /> },
        { href: '/pixel-to-em-converter', name: 'Pixel to EM Converter', icon: <Scaling className="size-4" /> },
        { href: '/aspect-ratio-calculator', name: 'Aspect Ratio Calculator', icon: <Crop className="size-4" /> },
        { href: '/screen-resolution-calculator', name: 'Screen Resolution (PPI)', icon: <SquareTerminal className="size-4" /> },
    ],
  },
  {
    title: 'Environment & Agriculture',
    description: 'Carbon Footprint, Solar Panel, Crop Yield.',
    icon: <Leaf className="size-8 text-primary" />,
    links: [
        { href: '/carbon-footprint-calculator', name: 'Carbon Footprint Calculator', icon: <Leaf className="size-4" /> },
        { href: '/water-usage-calculator', name: 'Water Usage Calculator', icon: <Droplets className="size-4" /> },
        { href: '/solar-panel-calculator', name: 'Solar Panel Calculator', icon: <Sun className="size-4" /> },
        { href: '/rainwater-harvesting-calculator', name: 'Rainwater Harvesting', icon: <Droplets className="size-4" /> },
        { href: '/fertilizer-requirement-calculator', name: 'Fertilizer Calculator', icon: <TestTube className="size-4" /> },
        { href: '/crop-yield-calculator', name: 'Crop Yield Calculator', icon: <LineChart className="size-4" /> },
        { href: '/greenhouse-gas-savings-calculator', name: 'Greenhouse Gas Savings', icon: <Recycle className="size-4" /> },
    ],
  },
  {
    title: 'Science',
    description: 'Molar Mass, pH, Ideal Gas Law, Ohm’s Law.',
    icon: <Atom className="size-8 text-primary" />,
    links: [
      { href: '/molar-mass-calculator', name: 'Molar Mass Calculator', icon: <TestTube className="size-4" /> },
      { href: '/ph-calculator', name: 'pH Calculator', icon: <Beaker className="size-4" /> },
      { href: '/ideal-gas-law-calculator', name: 'Ideal Gas Law Calculator', icon: <FlaskConical className="size-4" /> },
      { href: '/density-calculator', name: 'Density Calculator', icon: <Box className="size-4" /> },
      { href: '/acceleration-calculator', name: 'Acceleration Calculator', icon: <TrendingUp className="size-4" /> },
      { href: '/ohms-law-calculator', name: "Ohm's Law Calculator", icon: <Zap className="size-4" /> },
      { href: '/newtons-law-calculator', name: "Newton's Second Law Calculator", icon: <Atom className="size-4" /> },
      { href: '/kinetic-energy-calculator', name: 'Kinetic Energy Calculator', icon: <Flame className="size-4" /> },
    ],
  },
  {
    title: 'Engineering & Technical',
    description: 'For mechanical, electrical, and civil engineers.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8 text-primary"
      >
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M12 2v2" />
        <path d="M12 22v-2" />
        <path d="m17 20.66-1-1.73" />
        <path d="m7 4.08 1 1.73" />
        <path d="m17 4.08-1 1.73" />
        <path d="m7 20.66 1-1.73" />
        <path d="M4 12H2" />
        <path d="M22 12h-2" />
        <path d="m20.66 17-1.73-1" />
        <path d="m4.08 7 1.73 1" />
        <path d="m20.66 7-1.73 1" />
        <path d="m4.08 17 1.73-1" />
      </svg>
    ),
    links: [
      { href: '/gear-ratio-calculator', name: 'Gear Ratio Calculator', icon: <Cog className="size-4" /> },
      { href: '/electrical-load-calculator', name: 'Electrical Load Calculator', icon: <Bolt className="size-4" /> },
      { href: '/ohms-law-calculator', name: "Ohm's Law Calculator", icon: <Zap className="size-4" /> },
      { href: '/newtons-law-calculator', name: "Newton's Second Law Calculator", icon: <Atom className="size-4" /> },
      { href: '/kinetic-energy-calculator', name: 'Kinetic Energy Calculator', icon: <Flame className="size-4" /> },
      { href: '/torque-calculator', name: 'Torque Calculator', icon: <RotateCw className="size-4" /> },
      { href: '/voltage-drop-calculator', name: 'Voltage Drop Calculator', icon: <TrendingDown className="size-4" /> },
      { href: '/battery-backup-calculator', name: 'Battery Backup Calculator', icon: <BatteryCharging className="size-4" /> },
      { href: '/transformer-efficiency-calculator', name: 'Transformer Efficiency', icon: <Activity className="size-4" /> },
    ],
  },
  {
    title: 'Travel & Transport',
    description: 'Useful in apps related to logistics or tourism.',
    icon: <Luggage className="size-8 text-primary" />,
    links: [
      { href: '/distance-fuel-cost-calculator', name: 'Distance & Fuel Cost Calculator', icon: <Fuel className="size-4" /> },
      { href: '/travel-time-estimator', name: 'Travel Time Estimator', icon: <Clock className="size-4" /> },
      { href: '/speed-converter', name: 'Speed Converter', icon: <Gauge className="size-4" /> },
    ],
  },
];


const allLinks = calculatorCategories.flatMap(category => category.links.map(link => ({ ...link, category: category.title })));

export default function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredLinks = useMemo(() => {
    let links = allLinks;
    if (selectedCategory !== 'All') {
      links = links.filter(link => link.category === selectedCategory);
    }
    if (searchQuery) {
      links = links.filter(link => link.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return links;
  }, [searchQuery, selectedCategory]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      if (selectedCategory === 'All') return calculatorCategories;
      return calculatorCategories.filter(cat => cat.title === selectedCategory);
    }
    
    const categoriesMap = new Map();
    
    searchResults.forEach(link => {
      if (!categoriesMap.has(link.category)) {
        const originalCategory = calculatorCategories.find(c => c.title === link.category);
        if (originalCategory) {
          categoriesMap.set(link.category, { ...originalCategory, links: [] });
        }
      }
      if (categoriesMap.has(link.category)) {
        categoriesMap.get(link.category).links.push(link);
      }
    });

    return Array.from(categoriesMap.values());
  }, [searchQuery, selectedCategory]);
  

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return [];
    }
    return allLinks.filter(link =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
                 <AnimatedHero />
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
              <div className="w-full max-w-xl mx-auto py-4 relative">
                <Input
                  type="text"
                  placeholder="Search for a calculator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)} // Delay to allow click on results
                  className="w-full"
                />
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    <ul>
                      {searchResults.map(link => (
                        <li key={link.href}>
                           <Link href={link.href} className="block p-3 hover:bg-secondary">
                              <p className="font-semibold">{link.name}</p>
                              <p className="text-sm text-muted-foreground">{link.category}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('All')}
                >
                  All
                </Button>
                {calculatorCategories.map((category) => (
                  <Button
                    key={category.title}
                    variant={selectedCategory === category.title ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.title)}
                  >
                    {category.title}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredCategories
                .map((card) => (
                  <CalculatorCard
                    key={card!.title}
                    href={'#'}
                    icon={card!.icon}
                    title={card!.title}
                    description={card!.description}
                    links={card!.links}
                  />
              ))}
            </div>
             {filteredCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No calculators found for this category.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
