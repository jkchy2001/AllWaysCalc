
'use client';
import {
    Banknote, GraduationCap, HeartPulse, FlaskConical, Ruler,
    Construction, Leaf, Monitor, Atom, Briefcase, Calculator, Car, Landmark,
    Percent, Wallet, Home, BrainCircuit, Sparkles, Baby, Droplet, BedDouble,
    PersonStanding, Timer, HeartHandshake, Gift, Layers, TrendingUp, Layers3,
    PaintBucket, WalletCards, DownloadCloud, Signal, Network, Scaling, Crop,
    Building, PiggyBank, TrendingDown, LineChart, FunctionSquare, BookOpen,
    ClipboardCheck, CalculatorIcon, Pi, Sigma, Minus, Shuffle, Binary, Scale,
    Bone, Flame, Activity, UserCheck, Dumbbell, BarChart, Target, FileText,
    FileMinus, FilePlus, Coins, Receipt, CandlestickChart, Building2,
    CalendarDays, PercentCircle, BookMarked, Book, FileClock, Notebook,
    GraduationCapIcon, TestTube, Beaker, TestTubes, Footprints, Clock,
    CalendarHeart, CalendarClock, Users, Star, Gem, Palette,
    ClipboardList, Thermometer, Gauge, FileDigit, SquareTerminal, Sun,
    Recycle, Zap, Box, CreditCard, Luggage, Fuel, Cog, RotateCw, BatteryCharging,
} from 'lucide-react';
import { useMotionValue, motion, useSpring, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

const allIcons = [
    Banknote, GraduationCap, HeartPulse, FlaskConical, Ruler, Construction,
    Leaf, Monitor, Atom, Briefcase, Calculator, Car, Landmark, Percent,
    Wallet, Home, BrainCircuit, Sparkles, Baby, Droplet, BedDouble,
    PersonStanding, Timer, HeartHandshake, Gift, Layers, TrendingUp, Layers3,
    PaintBucket, WalletCards, DownloadCloud, Signal, Network, Scaling, Crop,
    Building, PiggyBank, TrendingDown, LineChart, FunctionSquare, BookOpen,
    ClipboardCheck, CalculatorIcon, Pi, Sigma, Minus, Shuffle, Binary, Scale,
    Bone, Flame, Activity, UserCheck, Dumbbell, BarChart, Target, FileText,
    FileMinus, FilePlus, Coins, Receipt, CandlestickChart, Building2,
    CalendarDays, PercentCircle, BookMarked, Book, FileClock, Notebook,
    GraduationCapIcon, TestTube, Beaker, TestTubes, Footprints, Clock,
    CalendarHeart, CalendarClock, Users, Star, Gem, Palette, ClipboardList,
    Thermometer, Gauge, FileDigit, SquareTerminal, Sun, Recycle, Zap, Box,
    CreditCard, Luggage, Fuel, Cog, RotateCw, BatteryCharging
];

export const HeroGrid = () => {
  return (
    <div className="relative grid h-full w-full place-content-center overflow-hidden rounded-lg bg-transparent px-8 py-20">
      <IconGrid />
    </div>
  );
};

const IconGrid = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="grid h-full grid-cols-8 grid-rows-12 gap-2"
    >
      {allIcons.map((Icon, i) => (
        <AppIcon
          mouseX={mouseX}
          mouseY={mouseY}
          key={i}
          icon={Icon}
        />
      ))}
    </div>
  );
};

const AppIcon = ({ mouseX, mouseY, icon: Icon }: { mouseX: any, mouseY: any, icon: React.ElementType }) => {
  const ref = useRef<HTMLDivElement>(null);
  const distance = useTransform([mouseX, mouseY], ([newX, newY]) => {
    if (!ref.current) return 1000;
    const { x, y, width, height } = ref.current.getBoundingClientRect();
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const distance = Math.sqrt(
      Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2)
    );
    return distance;
  });

  const scale = useSpring(useTransform(distance, [0, 200], [1.5, 1]), {
    stiffness: 400,
    damping: 20,
  });

  const opacity = useSpring(useTransform(distance, [0, 250], [1, 0.2]), {
    stiffness: 400,
    damping: 20,
  });

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary shadow-inner"
    >
      <Icon className="h-4 w-4" />
    </motion.div>
  );
};
