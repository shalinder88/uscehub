"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const paaQuestions = [
  {
    question: "What is the difference between observership and externship?",
    answer:
      "An observership is a shadowing-only experience where you watch physicians practice without direct patient contact. An externship (clinical rotation) is a hands-on experience where you actively participate in patient care, write notes, and present cases. Externships carry more weight in residency applications but typically require ECFMG certification or passing USMLE Step 1 and Step 2 CK.",
  },
  {
    question: "How much does a clinical observership cost in the USA?",
    answer:
      "Clinical observership costs range from free to several thousand dollars depending on the institution and duration. Many university-affiliated programs charge $500-$2,000 for a 4-week rotation, while some community hospitals and clinics offer free observerships. Always verify fees directly with the institution before applying.",
  },
  {
    question: "Do I need ECFMG certification for an observership?",
    answer:
      "Most observerships do not require ECFMG certification since observers do not have direct patient contact. However, externships and hands-on clinical rotations typically require ECFMG certification or at minimum passing USMLE Step 1 and Step 2 CK. Requirements vary by program, so check each listing carefully.",
  },
  {
    question: "Can I do an observership on a B1/B2 visa?",
    answer:
      "Yes, most observerships can be completed on a B1/B2 visitor visa since they involve observation only, with no patient contact or compensation. The B1 visa is more appropriate than the B2 for clinical observation. For hands-on externships, a J-1 or other sponsored visa is typically required.",
  },
  {
    question: "Which hospitals offer free observerships for IMGs?",
    answer:
      "Several hospitals offer free or low-cost observerships for IMGs, particularly community hospitals and some academic medical centers. Programs at NYC Health + Hospitals facilities, some VA hospitals, and community-based clinics may waive fees. USCEHub lets you filter listings by cost to find free programs across the United States.",
  },
  {
    question: "How do I find a research fellowship as an IMG?",
    answer:
      "The most effective approach is cold-emailing Principal Investigators (PIs) at academic medical centers with a tailored message referencing their recent publications. Expect a 2-5% response rate, so plan to send 50-100+ emails. You can also browse research fellowship listings on USCEHub and check institutional websites for posted positions.",
  },
  {
    question: "What is USCE and why do I need it?",
    answer:
      "USCE stands for United States Clinical Experience, encompassing observerships, externships, and clinical rotations at U.S. healthcare facilities. It is considered essential for IMGs applying to residency because it demonstrates your ability to function in the American healthcare system and provides opportunities for U.S.-based Letters of Recommendation.",
  },
  {
    question: "How long does an observership typically last?",
    answer:
      "Most observerships last 2 to 4 weeks, though some programs offer rotations of up to 12 weeks. The ideal duration depends on your goals: a minimum of 4 weeks is recommended to build enough rapport with an attending to secure a meaningful Letter of Recommendation.",
  },
  {
    question: "Can I get a letter of recommendation from an observership?",
    answer:
      "Yes, many observership programs offer the possibility of obtaining a Letter of Recommendation, though it is not guaranteed. The quality depends on the duration of your program, your level of engagement, and the attending physician's willingness. Discuss LOR expectations early in your rotation.",
  },
  {
    question:
      "What is the best time to do an observership before applying to residency?",
    answer:
      "The ideal time is 6-12 months before the ERAS application opens in September. This allows enough time to complete the experience, secure Letters of Recommendation, and incorporate the experience into your personal statement. Many applicants complete observerships between January and June of their application year.",
  },
];

export function PeopleAlsoAsk() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: paaQuestions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="border-t border-slate-200 bg-white py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            People Also Ask
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Common questions from International Medical Graduates about clinical
            experiences in the USA
          </p>
        </div>

        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
          {paaQuestions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-slate-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
