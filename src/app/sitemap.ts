import { MetadataRoute } from 'next';

const calculatorLinks = [
    '/loan-calculator', '/home-loan-calculator', '/personal-loan-calculator', 
    '/car-loan-calculator', '/business-loan-calculator', '/loan-eligibility-calculator', 
    '/sip-calculator', '/fd-calculator', '/rd-calculator', '/ppf-calculator', 
    '/lumpsum-calculator', '/mutual-fund-calculator', '/tip-calculator', 
    '/compound-interest-calculator', '/simple-interest-calculator', '/retirement-calculator', 
    '/inflation-calculator', '/cagr-calculator', '/debt-to-income-ratio-calculator', 
    '/gst-calculator', '/income-tax-calculator', '/hra-calculator', '/gratuity-calculator', 
    '/tds-calculator', '/advance-tax-calculator', '/salary-calculator', 
    '/discount-calculator', '/profit-margin-calculator', '/markup-calculator', 
    '/break-even-point-calculator', '/net-profit-calculator', '/npv-calculator', 
    '/tds-late-fee-calculator', '/credit-card-interest-calculator', 
    '/overdraft-interest-calculator', '/prepayment-vs-tenure-reduction-calculator', 
    '/balance-transfer-benefit-calculator', '/emi-in-arrears-vs-advance-calculator', 
    '/credit-score-impact-simulator', '/mortgage-refinance-calculator', 
    '/percentage-calculator', '/gpa-calculator', '/cgpa-to-percentage-calculator', 
    '/semester-grade-calculator', '/exam-marks-needed-calculator', '/attendance-calculator', 
    '/time-management-calculator', '/assignment-weight-calculator', 
    '/memory-retention-calculator', '/basic-arithmetic-calculator', 
    '/scientific-calculator', '/geometry-calculator', '/trigonometry-calculator', 
    '/percentage-change-calculator', '/quadratic-equation-solver', '/equation-solver', 
    '/matrix-calculator', '/derivative-calculator', '/lcm-hcf-calculator', 
    '/modulo-calculator', '/mean-median-mode-calculator', 
    '/permutations-combinations-calculator', '/probability-calculator', 
    '/distance-formula-calculator', '/slope-calculator', '/speed-distance-time-calculator', 
    '/bmi-calculator', '/bmr-calculator', '/calorie-intake-calculator', 
    '/ideal-weight-calculator', '/body-fat-percentage-calculator', 
    '/waist-to-height-ratio-calculator', '/waist-to-hip-ratio-calculator', 
    '/macronutrient-calculator', '/water-intake-calculator', '/heart-rate-calculator', 
    '/steps-to-calories-calculator', '/length-converter', '/mass-converter', 
    '/temperature-converter', '/volume-converter', '/speed-converter', 
    '/shoe-size-converter', '/html-color-code-converter', '/pixel-to-em-converter', 
    '/age-calculator', '/date-duration-calculator', '/countdown-timer-calculator', 
    '/pregnancy-due-date-calculator', '/ovulation-calculator', '/sleep-cycle-calculator', 
    '/anniversary-calculator', '/life-expectancy-calculator', '/zodiac-sign-calculator', 
    '/love-compatibility-calculator', '/marriage-date-compatibility-calculator', 
    '/numerology-calculator', '/baby-name-numerology-calculator', 
    '/lucky-number-calculator', '/paint-calculator', '/tile-calculator', 
    '/brick-calculator', '/concrete-calculator', '/plaster-calculator', 
    '/roof-area-calculator', '/stair-calculator', '/wallpaper-calculator', 
    '/flooring-cost-calculator', '/download-time-calculator', '/bandwidth-calculator', 
    '/bitrate-calculator', '/file-size-calculator', '/ip-subnet-calculator', 
    '/aspect-ratio-calculator', '/screen-resolution-calculator', 
    '/carbon-footprint-calculator', '/water-usage-calculator', '/solar-panel-calculator', 
    '/rainwater-harvesting-calculator', '/fertilizer-requirement-calculator', 
    '/crop-yield-calculator', '/greenhouse-gas-savings-calculator', 
    '/molar-mass-calculator', '/ph-calculator', '/ideal-gas-law-calculator', 
    '/density-calculator', '/acceleration-calculator', '/ohms-law-calculator', 
    "/newtons-law-calculator", "/kinetic-energy-calculator", '/gear-ratio-calculator', 
    '/electrical-load-calculator', '/torque-calculator', '/voltage-drop-calculator', 
    '/battery-backup-calculator', '/transformer-efficiency-calculator', 
    '/distance-fuel-cost-calculator', '/travel-time-estimator'
];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://allwayscalc.com';

    const calculatorUrls = calculatorLinks.map(link => ({
        url: `${baseUrl}${link}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as 'monthly',
        priority: 0.8,
    }));

    const staticUrls = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as 'weekly', priority: 1.0 },
        { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'yearly' as 'yearly', priority: 0.5 },
        { url: `${baseUrl}/contact-us`, lastModified: new Date(), changeFrequency: 'yearly' as 'yearly', priority: 0.5 },
        { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as 'monthly', priority: 0.6 },
        { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly' as 'yearly', priority: 0.3 },
        { url: `${baseUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'yearly' as 'yearly', priority: 0.3 },
        { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly' as 'yearly', priority: 0.3 },
    ];

  return [...staticUrls, ...calculatorUrls];
}
