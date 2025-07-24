
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
  Beaker,
  TestTubes,
  Footprints,
  Clock,
  CalendarHeart,
  CalendarClock,
  Users,
  Star,
  Gem,
  Palette,
  ClipboardList,
  Thermometer,
  Gauge,
  FileDigit,
  SquareTerminal,
  Sun,
  Recycle,
  Zap,
  Box,
  CreditCard,
  Luggage,
  Fuel,
  Cog,
  RotateCw,
  BatteryCharging,
  Bolt,
  FlaskConical,
  Droplets,
} from 'lucide-react';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const calculatorCategories = [
  {
    title: 'Finance & Investment',
    icon: <Banknote className="size-6" />,
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
    icon: <Briefcase className="size-6" />,
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
    title: 'Banking & Credit',
    icon: <CreditCard className="size-6" />,
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
    icon: <GraduationCap className="size-6" />,
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
    icon: <Calculator className="size-6" />,
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
    icon: <HeartPulse className="size-6" />,
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
    icon: <Ruler className="size-6" />,
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
    icon: <Heart className="size-6" />,
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
    icon: <Construction className="size-6" />,
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
    icon: <Monitor className="size-6" />,
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
    icon: <Leaf className="size-6" />,
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
    icon: <Atom className="size-6" />,
    links: [
      { href: '/molar-mass-calculator', name: 'Molar Mass Calculator', icon: <TestTube className="size-4" /> },
      { href: '/ph-calculator', name: 'pH Calculator', icon: <Beaker className="size-4" /> },
      { href: '/ideal-gas-law-calculator', name: 'Ideal Gas Law Calculator', icon: <FlaskConical className="size-4" /> },
      { href: '/density-calculator', name: 'Density Calculator', icon: <Box className="size-4" /> },
      { href: '/acceleration-calculator', name: 'Acceleration Calculator', icon: <TrendingUp className="size-4" /> },
      { href: '/ohms-law-calculator', name: "Ohm's Law Calculator", icon: <Zap className="size-4" /> },
      { href: "/newtons-law-calculator", name: "Newton's Second Law Calculator", icon: <Atom className="size-4" /> },
      { href: "/kinetic-energy-calculator", name: 'Kinetic Energy Calculator', icon: <Flame className="size-4" /> },
    ],
  },
  {
    title: 'Engineering & Technical',
    icon: <Cog className="size-6" />,
    links: [
      { href: '/gear-ratio-calculator', name: 'Gear Ratio Calculator', icon: <Cog className="size-4" /> },
      { href: '/electrical-load-calculator', name: 'Electrical Load Calculator', icon: <Bolt className="size-4" /> },
      { href: '/ohms-law-calculator', name: "Ohm's Law Calculator", icon: <Zap className="size-4" /> },
      { href: "/newtons-law-calculator", name: "Newton's Second Law Calculator", icon: <Atom className="size-4" /> },
      { href: "/kinetic-energy-calculator", name: 'Kinetic Energy Calculator', icon: <Flame className="size-4" /> },
      { href: '/torque-calculator', name: 'Torque Calculator', icon: <RotateCw className="size-4" /> },
      { href: '/voltage-drop-calculator', name: 'Voltage Drop Calculator', icon: <TrendingDown className="size-4" /> },
      { href: '/battery-backup-calculator', name: 'Battery Backup Calculator', icon: <BatteryCharging className="size-4" /> },
      { href: '/transformer-efficiency-calculator', name: 'Transformer Efficiency', icon: <Activity className="size-4" /> },
    ],
  },
  {
    title: 'Travel & Transport',
    icon: <Luggage className="size-6" />,
    links: [
      { href: '/distance-fuel-cost-calculator', name: 'Distance & Fuel Cost Calculator', icon: <Fuel className="size-4" /> },
      { href: '/travel-time-estimator', name: 'Travel Time Estimator', icon: <Clock className="size-4" /> },
      { href: '/speed-converter', name: 'Speed Converter', icon: <Gauge className="size-4" /> },
    ],
  },
];


const allLinks = calculatorCategories.flatMap(category => category.links.map(link => ({ ...link, category: category.title })));

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLinks = useMemo(() => {
    if (!searchQuery) {
      return allLinks;
    }
    return allLinks.filter(link =>
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      return calculatorCategories;
    }
    const categoriesMap = new Map();
    
    filteredLinks.forEach(link => {
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
  }, [filteredLinks]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full pt-12 md:pt-24 lg:pt-32">
          <div className="container px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-primary">
                The Ultimate Calculator Suite
              </h1>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl mt-4">
                From simple math to complex engineering, find the right tool for any calculation.
              </p>
            </motion.div>
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full max-w-xl mx-auto mt-8"
             >
              <Input
                type="text"
                placeholder="Search for a calculator (e.g., 'Loan', 'BMI', 'Paint')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 text-lg rounded-full bg-background/50 border-border/50 backdrop-blur-sm"
              />
            </motion.div>
          </div>
        </section>
        
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
             {filteredCategories.map((category, index) => (
              <motion.div 
                key={category.title} 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              >
                <h2 className="text-2xl font-bold font-headline flex items-center gap-3 mb-6">
                   {category.icon}
                   {category.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.links.map((link) => (
                    <Link href={link.href} key={link.href} className="group">
                        <div className="bg-card/50 border rounded-lg p-4 h-full flex items-center gap-3 transition-all duration-300 hover:bg-card hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
                          <div className="bg-muted p-2 rounded-md">
                              {link.icon}
                          </div>
                          <h3 className="font-semibold text-md">{link.name}</h3>
                        </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
             {filteredCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No calculators found. Try a different search term.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
