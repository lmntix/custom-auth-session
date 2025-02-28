import { CreditCard, Users, FileText, BarChart3, PiggyBank, Receipt } from 'lucide-react';
import { SiteHeader } from './_components/site-header';
import LandingFooter from './_components/site-footer';
import { HoverEffect } from '@/components/ui/hover-effect';

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section id="home" className="flex-grow flex items-center justify-center">
        <div className="container max-w-[64rem] px-4 py-10 text-center">
          <h1 className="font-sans text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            Pocket Finance
          </h1>
          <p className="max-w-[42rem] mx-auto font-display leading-normal text-muted-foreground sm:text-xl sm:leading-8 mb-8">
            Pocket Finance is a modern and comprehensive finance management tool designed specifically for credit
            cooperative societies.
          </p>
        </div>
      </section>
      <section id="features" className="flex-grow flex items-center justify-center">
        <div className="container max-w-[64rem] px-4 text-center">
          <HoverEffect items={features} />
        </div>
      </section>
      <section id="pricing" className="flex-grow flex items-center justify-center">
        <div className="container max-w-[64rem] px-4 py-16 text-center">
          {/* <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl mb-6">
            Simple, transparent pricing
          </h2>
          <p className="max-w-[85%] mx-auto leading-normal text-muted-foreground sm:text-lg sm:leading-7 mb-12">
            Unlock all features including unlimited posts for your organisation.
          </p> */}
          {/* <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_200px] mb-12">
            <div className="grid gap-6 text-left">
              <h3 className="text-xl font-bold sm:text-2xl">
                What&apos;s included in the application
              </h3>
              <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {featuresList.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4 text-center">
              <div>
                <h4 className="text-5xl font-bold">₹3500</h4>
                <p className="text-sm font-medium text-muted-foreground">
                  Billed Monthly
                </p>
              </div>
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Get Started
              </Link>
            </div>
          </div> */}
          <p className="max-w-[85%] mx-auto leading-normal text-muted-foreground sm:leading-7">
            There are no hidden fees. <br />
            <strong>
              You can stop using the services whenever you want and you won&apos;t be charged from the next month.
            </strong>
          </p>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
}

const features = [
  {
    title: 'Account Management',
    description: 'Track transactions and balances with ease',
    icon: <CreditCard className="h-8 w-8 text-blue-500" />,
    color: '#3B82F6', // blue-500
  },
  {
    title: 'Member Management',
    description: 'Maintain detailed member profiles and records',
    icon: <Users className="h-8 w-8 text-green-500" />,
    color: '#22C55E', // green-500
  },
  {
    title: 'Loan Management',
    description: 'Process loan applications and approvals efficiently',
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    color: '#A855F7', // purple-500
  },
  {
    title: 'Financial Reporting',
    description: 'Create comprehensive financial reports',
    icon: <BarChart3 className="h-8 w-8 text-yellow-500" />,
    color: '#EAB308', // yellow-500
  },
  {
    title: 'Savings Management',
    description: 'Manage savings accounts and plans effectively',
    icon: <PiggyBank className="h-8 w-8 text-pink-500" />,
    color: '#EC4899', // pink-500
  },
  {
    title: 'Expense Tracking',
    description: 'Record and categorize expenses accurately',
    icon: <Receipt className="h-8 w-8 text-indigo-500" />,
    color: '#6366F1', // indigo-500
  },
];

const featuresList = [
  'Account Management',
  'Member Management',
  'Loan Management',
  'Financial Reporting',
  'Savings Management',
  'Expense Tracking',
];
