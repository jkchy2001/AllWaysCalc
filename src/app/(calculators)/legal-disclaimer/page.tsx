
'use client';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
            
            <p>The information and calculators provided by AllWaysCalc on this website are for general informational and educational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or calculation on the site.</p>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">Professional Disclaimer</h2>
              <p>
                The website cannot and does not contain financial, health, legal, or engineering advice. The information is provided for general informational and educational purposes only and is not a substitute for professional advice.
              </p>
              <p>
                Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. For example, financial calculations are not investment advice, health calculators are not medical advice, and engineering calculators are not a substitute for consultation with a licensed engineer. The use or reliance of any information contained on this site is solely at your own risk.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">External Links Disclaimer</h2>
              <p>
                The Site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold">Errors and Omissions Disclaimer</h2>
              <p>
                While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources and that the calculators are as accurate as possible, AllWaysCalc is not responsible for any errors or omissions, or for the results obtained from the use of this information.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
