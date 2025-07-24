
'use client';

import type { Metadata } from 'next';
import { Header } from '@/components/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) - AllWaysCalc',
  description: 'Find answers to common questions about our calculators, the concepts behind them, and how to use our tools effectively. Covering finance, health, science, and more.',
};

const faqData = {
    "General": [
        {
            q: "Are the calculators on this website accurate?",
            a: "Our calculators are designed to be as accurate as possible for informational and educational purposes, based on standard, publicly available formulas. However, for critical financial, medical, or engineering decisions, you should always consult a qualified professional. Think of these tools as excellent starting points and estimators, not as a substitute for professional advice."
        },
        {
            q: "Is my data saved when I use a calculator?",
            a: "No. We prioritize your privacy. All calculations are performed entirely within your browser (client-side). We do not see, store, or share any of the personal or financial data you enter into the calculators."
        },
        {
            q: "How often are the calculators updated?",
            a: "We periodically review our calculators to ensure they are using up-to-date formulas and information, especially for tools related to tax and finance which can change based on new regulations. If you believe a calculator is out of date, please let us know."
        },
        {
            q: "Can I suggest a new calculator?",
            a: "Absolutely! We are always looking to expand our suite of tools. Please use the feedback mechanism on our website to suggest new calculators you'd like to see."
        }
    ],
    "Finance & Investment": [
        {
            q: "What is the difference between simple and compound interest?",
            a: "Simple interest is calculated only on the original principal amount. Compound interest is calculated on the principal amount plus the accumulated interest from previous periods. This 'interest on interest' effect makes compounding much more powerful for long-term growth."
        },
        {
            q: "What is a 'good' rate of return for an investment?",
            a: "A 'good' return is relative to the risk involved. Low-risk investments like Fixed Deposits (FDs) offer lower, more predictable returns (e.g., 5-7%). Higher-risk investments like equity mutual funds have the potential for higher returns (e.g., 12-15% or more over the long term) but also carry the risk of loss."
        },
        {
            q: "What is the difference between reducing EMI and reducing tenure when prepaying a loan?",
            a: "Choosing 'Reduce Tenure' means you keep paying the same EMI amount, but you pay off the loan much faster. This option saves you the most money in total interest. Choosing 'Reduce EMI' lowers your monthly payment obligation, which improves your immediate cash flow, but results in less overall interest savings compared to tenure reduction."
        },
        { q: "What does 'CAGR' mean?", a: "CAGR stands for Compound Annual Growth Rate. It's a way to smooth out the ups and downs of an investment's performance over several years to give you a single, representative annual growth rate." },
        { q: "Why is my home loan EMI mostly interest in the beginning?", a: "This is due to how amortization works. In the early years of a loan, the principal balance is very high, so a larger portion of your fixed EMI payment goes towards paying the interest on that large balance. As the principal gets paid down, the interest portion of your EMI decreases, and the principal portion increases." },
        { q: "What is a SIP and why is it recommended for beginners?", a: "A SIP (Systematic Investment Plan) is a method of investing a fixed amount of money in mutual funds at regular intervals (usually monthly). It's recommended because it promotes disciplined investing and benefits from 'rupee cost averaging'—you automatically buy more units when prices are low and fewer when prices are high." }

    ],
    "Business & Tax": [
        { q: "What is the difference between markup and profit margin?", a: "Markup is the percentage of profit relative to the cost (Profit / Cost). Profit Margin is the percentage of profit relative to the selling price (Profit / Revenue). For example, if an item costs ₹50 and sells for ₹100, the markup is 100%, but the profit margin is 50%." },
        { q: "What is the 'break-even point'?", a: "The break-even point is the level of sales at which your total revenues equal your total costs. At this point, you have no profit and no loss. It's a crucial number for understanding the minimum sales needed to run a sustainable business." },
        { q: "Why do I have to calculate HRA exemption in three different ways?", a: "The Income Tax Act specifies that the HRA exemption you can claim is the minimum of three calculated amounts: 1) The actual HRA you receive, 2) Your rent paid minus 10% of your salary, and 3) 40% or 50% of your salary depending on your city. This rule prevents disproportionately high exemption claims." },
        { q: "What is TDS and why is it deducted from my salary?", a: "TDS stands for Tax Deducted at Source. It's a mechanism where your employer estimates your total annual income tax, divides it by 12, and deducts that amount from your salary each month to pay to the government on your behalf. This ensures a steady collection of taxes for the government and prevents a large tax burden for you at the end of the year." },
        { q: "What's the difference between the Old and New Tax Regimes in India?", a: "The Old Regime allows you to claim a wide range of deductions (like 80C, HRA). The New Regime offers different tax slabs, which are often lower, but you have to forgo most of those deductions. The New Regime is the default option as of FY 2023-24." }
    ],
    "Health & Fitness": [
        {
            q: "What is BMI and is it a good measure of health?",
            a: "Body Mass Index (BMI) is a simple ratio of your weight to your height. It's a useful, quick screening tool for potential weight-related health risks but it's not perfect. It can't distinguish between muscle mass and fat, so a very muscular person might have a high BMI. For a better picture, it's good to also consider metrics like Waist-to-Height Ratio."
        },
        { q: "What's the difference between BMR and maintenance calories?", a: "Your Basal Metabolic Rate (BMR) is the number of calories your body needs to perform its most basic life-sustaining functions, like breathing and circulation, if you were at complete rest. Your maintenance calories (or TDEE) are your BMR plus the calories you burn through all your daily activities, including exercise. Maintenance calories are what you need to eat to stay at the same weight." },
        {
            q: "How accurate is the sleep cycle calculator?",
            a: "It's an estimate based on the average human sleep cycle of 90 minutes. The goal is to help you avoid waking up during a deep sleep stage, which causes grogginess. Your personal sleep cycles might be slightly different, so use it as a guideline and see what works best for you."
        },
        {
            q: "Do I need to drink the exact amount of water suggested?",
            a: "The water intake calculator provides a personalized estimate and a great daily goal. However, the best advice is to listen to your body. Drink when you're thirsty, and a good rule of thumb is to check that your urine is a pale, light yellow color, which usually indicates good hydration."
        }
    ],
     "Math & Science": [
        {
            q: "What is the difference between a permutation and a combination?",
            a: "The key difference is order. In permutations, the order of selection matters (e.g., arranging books on a shelf or picking 1st, 2nd, and 3rd place winners). In combinations, the order does not matter (e.g., choosing a committee of three people from a group)."
        },
        {
            q: "Why is the tangent of 90 degrees undefined?",
            a: "The tangent of an angle is defined as the ratio of sine to cosine (sin(θ) / cos(θ)). At 90 degrees, the value of cos(90°) is 0. Since division by zero is mathematically undefined, the tangent is also undefined at that specific angle."
        },
        { q: "What is the difference between mass and weight?", a: "Mass is the amount of matter in an object and is constant everywhere (measured in kg). Weight is the force of gravity acting on that mass and can change depending on where you are (e.g., on the Moon). In everyday language, we often use the terms interchangeably." },
        { q: "What is the 'Ideal Gas Law'?", a: "The Ideal Gas Law (PV=nRT) is a fundamental equation in chemistry and physics that describes the state of a hypothetical 'ideal' gas. It's a very good approximation for the behavior of many real gases under normal conditions." }
    ],
    "Construction & Home": [
        { q: "Why do I need to account for 'wastage' when buying materials?", a: "Wastage is crucial because you will always lose some material to cuts, trimming, mistakes, or breakage during transport. For tiles, wallpaper, and flooring, a standard 10-15% wastage factor ensures you have enough material to complete the job and a little extra for any future repairs." },
        { q: "What is a 'roof pitch'?", a: "Roof pitch is a measure of the steepness of a roof. It's typically expressed as a ratio of 'rise' to 'run'. For example, a 4:12 pitch means that for every 12 units of horizontal distance (run), the roof rises by 4 units vertically." },
        { q: "Why does the plaster calculator use a 'dry volume' that is larger than the 'wet volume'?", a: "When you mix cement, sand, and water to make mortar, the water fills the tiny gaps (voids) between the sand particles. To get a certain final 'wet' volume of plaster on the wall, you need a larger 'dry' volume of raw materials before mixing. We account for this volumetric difference." }
    ]
};

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Frequently Asked Questions (FAQ)</CardTitle>
             <CardDescription>Find answers to common questions about our calculators and the concepts behind them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {Object.entries(faqData).map(([category, qas]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold font-headline mb-4">{category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {qas.map((qa, index) => (
                    <AccordionItem key={`${category}-${index}`} value={`${category}-item-${index}`}>
                      <AccordionTrigger className="text-left">{qa.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {qa.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
