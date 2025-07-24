
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              We value your feedback and are always looking for ways to improve AllWaysCalc. If you have any questions, suggestions for new calculators, or have found an issue with one of our tools, please feel free to reach out.
            </p>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Email
              </h2>
              <p>
                For all inquiries, please contact us at:
              </p>
              <a href="mailto:allwayscalc@gmail.com" className="text-primary font-semibold hover:underline">
                allwayscalc@gmail.com
              </a>
              <p>
                We do our best to respond to all emails within 48 business hours.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">Feedback & Suggestions</h2>
              <p>
                Your ideas help us grow. If you have a specific calculator you'd like to see on our platform, please include as much detail as possible in your email, such as the formula and its common uses. We appreciate your contribution to making AllWaysCalc the best calculator suite available.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
