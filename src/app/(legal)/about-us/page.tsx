
import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About AllWaysCalc - Our Mission and Vision',
  description: 'Learn about the mission behind AllWaysCalc. We are dedicated to providing a comprehensive, intuitive, and free suite of calculators for finance, health, science, and more.',
};

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">About AllWaysCalc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">Our Mission</h2>
              <p>
                At AllWaysCalc, our mission is to provide a comprehensive, intuitive, and completely free suite of calculators for everyone. We believe that access to reliable tools for calculation—whether for finance, health, science, or everyday life—should be simple and straightforward. We aim to empower students, professionals, and curious minds by making complex calculations accessible and easy to understand.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">What We Do</h2>
              <p>
                AllWaysCalc is a one-stop destination for a diverse range of calculators. Our platform is meticulously organized into categories like Finance, Health, Education, Science, and more, ensuring you can quickly find the tool you need. Each calculator is designed not just to give you an answer, but to help you understand the concepts behind it with clear explanations, formulas, and FAQs.
              </p>
            </div>

             <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">Our Commitment to Privacy</h2>
              <p>
                Your privacy is paramount to us. All calculations performed on our website are done client-side, meaning the data you enter never leaves your browser. We do not store or track any personal or financial information you input into our calculators. You can use our tools with the complete assurance that your data remains yours.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">The Team</h2>
              <p>
                AllWaysCalc was built by a passionate developer dedicated to creating useful and accessible web tools. Our goal is to continuously expand and refine our suite of calculators based on user feedback and evolving needs.
              </p>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">Get in Touch</h2>
              <p>
                We are always open to feedback and suggestions. If you have an idea for a new calculator or an improvement for an existing one, please don't hesitate to reach out through our Contact page.
              </p>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
