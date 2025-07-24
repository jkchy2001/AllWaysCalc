
import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms and Conditions - AllWaysCalc',
  description: 'Read the terms and conditions for using AllWaysCalc. By using our website and tools, you agree to these terms.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-CA')}</p>
            <p>Please read these terms and conditions carefully before using Our Service.</p>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">1. Agreement to Terms</h2>
              <p>By using our website, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you do not have permission to access the service.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">2. Use of Calculators</h2>
              <p>The calculators provided on AllWaysCalc are for informational and educational purposes only. We do not guarantee the accuracy, reliability, or completeness of any information or calculations provided. See our full Disclaimer for more details.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">3. Intellectual Property</h2>
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of AllWaysCalc and its licensors. The Service is protected by copyright, trademark, and other laws of both the India and foreign countries.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">4. Limitation of Liability</h2>
              <p>In no event shall AllWaysCalc, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">5. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">6. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms and Conditions on this page.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
