
'use client';

import { Header } from '@/components/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqData = {
    "General": [
        {
            q: "Are the calculators on this website accurate?",
            a: "Our calculators are designed for informational and educational purposes and are based on standard formulas. While we strive for accuracy, they should not be used as a substitute for professional advice. For critical calculations, always consult a qualified professional in the relevant field."
        },
        {
            q: "Is my data saved when I use a calculator?",
            a: "No. We respect your privacy. All calculations are performed directly in your browser. We do not see, store, or share any of the data you enter into the calculators."
        }
    ],
    "Finance & Investment": [
        {
            q: "What is the difference between simple and compound interest?",
            a: "Simple interest is calculated only on the original principal amount. Compound interest is calculated on the principal amount and also on the accumulated interest from previous periods. Over time, compounding leads to significantly faster growth."
        },
        {
            q: "What is a 'good' rate of return for an investment?",
            a: "A 'good' return is relative to the risk involved. Low-risk investments like Fixed Deposits (FDs) offer lower returns (e.g., 5-7%), while higher-risk investments like equity mutual funds have the potential for higher returns (e.g., 12-15% or more over the long term) but also carry the risk of loss."
        },
        {
            q: "What is the difference between reducing EMI and reducing tenure when prepaying a loan?",
            a: "Reducing the tenure (loan duration) while keeping the EMI the same saves you the most money in total interest and helps you become debt-free faster. Reducing the EMI lowers your monthly payment, which improves your monthly cash flow but results in less overall interest savings."
        }
    ],
    "Health & Fitness": [
        {
            q: "What is BMI and is it a good measure of health?",
            a: "Body Mass Index (BMI) is a simple measure of weight relative to height. It's a useful screening tool for potential weight issues but doesn't tell the whole story, as it can't distinguish between muscle and fat. For a complete picture, consider other metrics like body fat percentage or waist-to-height ratio."
        },
        {
            q: "How accurate is the sleep cycle calculator?",
            a: "It's an estimate based on average sleep cycle lengths (around 90 minutes). The goal is to help you avoid waking up during a deep sleep stage. Your personal sleep cycles may vary, so use it as a guideline and adjust based on how you feel."
        },
        {
            q: "Do I need to drink the exact amount of water suggested?",
            a: "The water intake calculator provides a personalized estimate. Think of it as a daily goal. The best advice is to listen to your body, drink when you're thirsty, and check that your urine is a pale yellow color."
        }
    ],
     "Math & Science": [
        {
            q: "What is the difference between a permutation and a combination?",
            a: "It comes down to order. In permutations, the order of selection matters (e.g., arranging books on a shelf). In combinations, the order does not matter (e.g., choosing a committee of people)."
        },
        {
            q: "Why is the tangent of 90 degrees undefined?",
            a: "The tangent of an angle is defined as sin(θ) / cos(θ). At 90 degrees, the value of cos(90°) is 0. Since division by zero is mathematically undefined, the tangent is also undefined at that angle."
        }
    ],
};

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Frequently Asked Questions (FAQ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {Object.entries(faqData).map(([category, qas]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold font-headline mb-4">{category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {qas.map((qa, index) => (
                    <AccordionItem key={`${category}-${index}`} value={`item-${index}`}>
                      <AccordionTrigger>{qa.q}</AccordionTrigger>
                      <AccordionContent>
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
