import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Home,
  CreditCard,
  Car,
  FileText,
  Shield,
  Phone,
  MapPin,
  Heart,
  Clock,
  AlertTriangle,
  DollarSign,
  Building2,
  Users,
  Stethoscope,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Post-Match Checklist for New Residents — Everything Before Day 1",
  description:
    "The complete checklist for newly matched residents — housing, SSN, driver's license, bank accounts, insurance, licensing, credentialing, and what to do before your first day of residency.",
  alternates: {
    canonical: "https://uscehub.com/residency/post-match",
  },
};

interface ChecklistSection {
  title: string;
  icon: typeof Home;
  color: string;
  timeframe: string;
  items: { task: string; detail: string; imgNote?: string }[];
}

const CHECKLIST: ChecklistSection[] = [
  {
    title: "Immediately After Match (Week 1)",
    icon: CheckCircle2,
    color: "text-success",
    timeframe: "March — within days of Match Day",
    items: [
      {
        task: "Accept your position and sign the contract",
        detail: "Review the contract carefully. Note start date, salary, benefits start date, and any stipulations. If you need more time, ask — most programs give 1-2 weeks.",
        imgNote: "For IMGs on J-1 or H-1B: confirm your visa status is compatible with the program start date. Contact your program coordinator about visa sponsorship timeline.",
      },
      {
        task: "Notify your medical school and ECFMG",
        detail: "Your school may need to update records. ECFMG certification should be up to date. If you matched through SOAP, additional paperwork may be needed.",
      },
      {
        task: "Start housing search",
        detail: "Begin looking immediately — near your hospital, fellow residents often share housing tips. Join the incoming resident Facebook/WhatsApp group if one exists.",
        imgNote: "IMGs arriving from abroad: you may not have a US credit history for apartment applications. Ask your program if they provide a letter for landlords or have institutional housing options.",
      },
    ],
  },
  {
    title: "Housing & Relocation (March-May)",
    icon: Home,
    color: "text-accent",
    timeframe: "3-4 months before start date",
    items: [
      {
        task: "Secure housing near your hospital",
        detail: "Budget: $800-2,500/month depending on city. Consider distance to hospital (you'll be exhausted after 28-hour calls — short commute matters). Many residents live within 15 minutes.",
      },
      {
        task: "Arrange your move",
        detail: "If relocating: get quotes from moving companies 6-8 weeks early. USPS mail forwarding. Update your address with medical school, ECFMG, banks, insurance.",
      },
      {
        task: "Set up utilities",
        detail: "Electricity, gas, water, internet. Set up before you arrive. You don't want to deal with this during orientation week.",
      },
      {
        task: "Check if program offers relocation assistance",
        detail: "Many programs offer $1,000-5,000 relocation stipend. Some offer temporary housing for the first 1-2 weeks. Ask your program coordinator.",
      },
    ],
  },
  {
    title: "Legal Documents & ID (April-May)",
    icon: FileText,
    color: "text-warning",
    timeframe: "2-3 months before start date",
    items: [
      {
        task: "Apply for Social Security Number (SSN)",
        detail: "Visit your local SSA office with: passport, visa documentation (DS-2019 or I-797), I-94, and employment letter from your program. Processing: 2-4 weeks.",
        imgNote: "IMGs: You MUST have a valid SSN before starting residency. Apply as soon as you arrive in the US or as soon as your visa status allows. Some SSA offices are very busy — go early.",
      },
      {
        task: "Get a state driver's license or ID",
        detail: "Visit your state DMV with: passport, SSN, proof of residency (utility bill, lease), visa documentation. Some states require a road test even if you have a foreign license.",
        imgNote: "Your international driver's license is valid temporarily in most states (30-90 days). Get a state license ASAP. You'll need it for ID purposes even if you don't drive.",
      },
      {
        task: "Open a US bank account",
        detail: "Bring: passport, SSN (or ITIN), proof of address. Major banks (Chase, Bank of America, Wells Fargo) are common. Consider a credit union for lower fees. Set up direct deposit with your program.",
        imgNote: "IMGs without SSN yet: some banks accept ITIN or passport alone for initial account opening. Chase, Citibank, and HSBC are generally IMG-friendly.",
      },
      {
        task: "Apply for a credit card (build credit)",
        detail: "Start building US credit history immediately. Secured credit cards (Discover Secured, Capital One Secured) require a deposit but help establish credit. Your credit score affects future housing, car loans, and even phone plans.",
      },
    ],
  },
  {
    title: "Medical Licensing & Credentialing (March-June)",
    icon: Stethoscope,
    color: "text-cyan",
    timeframe: "Must be complete before Day 1",
    items: [
      {
        task: "Apply for state medical training license/permit",
        detail: "Most states require a training license or limited permit for residents. Your program usually handles this but YOU must submit the application. Start immediately — processing takes 4-12 weeks.",
        imgNote: "IMGs: Ensure your ECFMG certification is current. Some states require additional documentation (medical school verification, transcript authentication). Start this process in March.",
      },
      {
        task: "Complete hospital credentialing",
        detail: "Your hospital will send a credentialing packet. Fill it out completely and return it on time. Delays in credentialing = delays in starting. This includes: background check, drug screening, immunization records, BLS/ACLS certification.",
      },
      {
        task: "Get BLS and ACLS certified",
        detail: "Most programs require current BLS (Basic Life Support) and ACLS (Advanced Cardiovascular Life Support) before starting. AHA courses are available online + in-person skills session. Budget $200-400.",
      },
      {
        task: "Complete immunization requirements",
        detail: "Hospitals require: Hep B series (with titer), MMR (with titers), Varicella (with titer), Tdap, annual flu shot, TB testing (QuantiFERON or PPD). COVID vaccination per hospital policy. Get these done early — some series take weeks.",
      },
      {
        task: "DEA registration",
        detail: "You'll need a DEA number to prescribe controlled substances. Your program usually helps with this. Fee: ~$888 for 3 years (some programs cover it). Apply through deadiversion.usdoj.gov.",
      },
    ],
  },
  {
    title: "Insurance & Benefits (May-June)",
    icon: Shield,
    color: "text-danger",
    timeframe: "Before your start date",
    items: [
      {
        task: "Enroll in health insurance",
        detail: "Your program provides health insurance but you must actively enroll during the enrollment window. Don't miss it. Coverage usually starts on your start date or first of the month after.",
      },
      {
        task: "Set up disability insurance",
        detail: "This is the insurance most residents skip and shouldn't. If you become unable to practice medicine, disability insurance replaces your income. Buy own-occupation disability during residency — it's cheapest when you're young and healthy. Budget $100-200/month.",
      },
      {
        task: "Review malpractice coverage",
        detail: "Your program provides malpractice insurance during residency. Confirm the type (occurrence vs claims-made) and limits. You don't need to buy your own during residency.",
      },
      {
        task: "Consider life insurance",
        detail: "If you have dependents, a term life insurance policy is inexpensive during residency ($20-50/month for $500K-1M coverage). If you have significant student loans, life insurance ensures your family isn't burdened.",
      },
      {
        task: "Set up retirement contributions",
        detail: "Most programs offer 403(b) or 401(k). If there's an employer match, contribute at least enough to get the full match — it's free money. Even $100/month during residency adds up.",
      },
    ],
  },
  {
    title: "Practical Prep (June — Before Day 1)",
    icon: Clock,
    color: "text-muted",
    timeframe: "Final 2-4 weeks",
    items: [
      {
        task: "Buy scrubs and white coats",
        detail: "Your program may provide some. If not: 3-4 sets of scrubs, 2 white coats (one will get stained). Comfortable shoes are not optional — you'll walk 5-8 miles/day.",
      },
      {
        task: "Get essential gear",
        detail: "Stethoscope (Littmann Classic III or Cardiology IV), penlight, portable phone charger, comfortable shoes with insoles, white coat pocket reference cards.",
      },
      {
        task: "Download essential apps",
        detail: "UpToDate or DynaMed, MDCalc, Epocrates or Lexicomp, Doximity, your hospital's EMR mobile app if available.",
      },
      {
        task: "Attend orientation",
        detail: "Usually 1-2 weeks before your official start date. Covers EMR training, hospital policies, badge access, parking, dress code. Take it seriously — the EMR training alone saves you hours in your first week.",
      },
    ],
  },
];

export default function PostMatchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Post-Match Checklist
        </h1>
        <p className="text-muted max-w-2xl text-base leading-relaxed">
          You matched. Congratulations. Now here&apos;s everything you need to
          do before your first day — housing, documents, licensing,
          insurance, and the stuff nobody tells you about until it&apos;s too
          late.
        </p>
        <p className="text-xs text-muted mt-2">
          IMG-specific notes included where applicable.
        </p>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-10">
        {CHECKLIST.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`rounded-lg bg-surface-alt p-2.5`}>
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-xs text-muted">{section.timeframe}</p>
                </div>
              </div>

              <div className="space-y-3 ml-2">
                {section.items.map((item) => (
                  <div
                    key={item.task}
                    className="rounded-lg border border-border bg-surface p-4"
                  >
                    <h3 className="text-sm font-semibold text-foreground mb-1 flex items-start gap-2">
                      <span className="h-4 w-4 rounded border border-border mt-0.5 shrink-0" />
                      {item.task}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed ml-6">
                      {item.detail}
                    </p>
                    {item.imgNote && (
                      <div className="mt-2 ml-6 rounded bg-accent/5 border border-accent/20 px-3 py-2">
                        <p className="text-xs text-accent">
                          <strong>IMG Note:</strong> {item.imgNote}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-xl border border-border bg-surface-alt p-6 text-center">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Starting Residency? We&apos;ve Got More
        </h3>
        <p className="text-sm text-muted mb-4">
          Check out our survival guide, board prep resources, and fellowship
          planning timeline.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/residency/survival"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Survival Guide
          </Link>
          <Link
            href="/residency/fellowship/guide"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
          >
            Fellowship Guide
          </Link>
          <Link
            href="/residency/boards"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
          >
            Board Prep
          </Link>
        </div>
      </div>
    </div>
  );
}
