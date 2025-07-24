
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Privacy Policy for AllWaysCalc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-CA')}</p>

            <p>
              Welcome to AllWaysCalc. We respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website and our practices for collecting, using, maintaining, protecting, and disclosing that information.
            </p>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">1. Information We Collect</h2>
              <p>We do not collect any personal identifiable information (PII) from our users. Our calculators function entirely within your browser and we do not store your input data on our servers.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">2. Cookies and Tracking Technologies</h2>
              <p>
                We and our third-party partners may use cookies, which are small text files placed on your device, to enhance your experience and to serve advertisements.
              </p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Essential Cookies:</strong> These are necessary for the website to function and cannot be switched off.</li>
                <li><strong>Performance and Analytics Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
                <li><strong>Advertising Cookies:</strong> These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">3. Third-Party Advertising (Google AdSense)</h2>
              <p>
                We use Google AdSense, a third-party advertising service, to serve ads when you visit our website. Google may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
              </p>
              <p>
                Google's use of the DART cookie enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.
              </p>
            </div>
            
             <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">4. Data Sharing and Disclosure</h2>
              <p>
                We do not collect personal data, so we do not share it. However, our third-party advertising partners may collect data as described above. We do not have access to or control over these cookies that are used by third-party advertisers.
              </p>
            </div>


            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">5. Children's Privacy</h2>
              <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">6. Changes to Our Privacy Policy</h2>
              <p>We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us through the feedback mechanism on our website.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
