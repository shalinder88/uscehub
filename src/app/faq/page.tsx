import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about clinical observerships, externships, USCE requirements, and how to use USCEHub to find IMG opportunities in the United States.",
  alternates: {
    canonical: "https://uscehub.com/faq",
  },
};

const faqs = [
  {
    question: "What is a clinical observership?",
    answer:
      "A clinical observership is a structured program where International Medical Graduates (IMGs) can observe clinical practice in U.S. healthcare settings. Unlike hands-on rotations, observerships allow participants to shadow physicians, attend rounds, and learn about the U.S. healthcare system without direct patient contact. They are valuable for gaining Letters of Recommendation, understanding clinical workflows, and strengthening residency applications.",
  },
  {
    question: "What is the difference between an observership, externship, and clinical rotation?",
    answer:
      "An observership is a shadowing-only experience where you observe clinical care without direct patient contact. You typically do not need ECFMG certification for observerships, and they are often available on a B1/B2 visa. An externship (also called a clinical rotation or elective) is a hands-on experience where you actively participate in patient care — taking histories, doing physical exams, writing notes, and presenting cases. Externships usually require ECFMG certification or at minimum passing USMLE Step 1 and Step 2 CK, and may require malpractice insurance. Externships carry significantly more weight in residency applications because they demonstrate your ability to function in the US clinical system. A clinical rotation is essentially the same as an externship — the terms are used interchangeably by most programs. Some medical schools abroad arrange clinical rotations at US hospitals as part of their curriculum, which can serve the same purpose as an externship.",
  },
  {
    question: "How do I apply for an observership or externship?",
    answer:
      "Browse our listings to find programs that match your interests and qualifications. Each listing links to the institution's official source — the institution's own page is always the canonical place to apply. A small number of participating programs may also let you express interest through USCEHub, but the official source remains authoritative. Make sure you meet the eligibility requirements before applying, including any USMLE score or ECFMG certification requirements.",
  },
  {
    question: "How much does an observership typically cost?",
    answer:
      "Costs vary significantly depending on the institution, duration, and type of program. Some programs are free, while others may charge fees ranging from a few hundred to several thousand dollars. Our platform displays cost information for each listing so you can compare before applying. Be cautious of programs with unusually high fees and always verify the legitimacy of the institution.",
  },
  {
    question: "Do I need ECFMG certification for an observership?",
    answer:
      "Requirements vary by program. Many observerships do not require ECFMG certification since observers do not have direct patient contact. However, externships and hands-on rotations often do require ECFMG certification or at minimum passing USMLE Step 1 and Step 2 CK. Each listing on our platform clearly states the requirements so you can determine eligibility.",
  },
  {
    question: "Can I get a Letter of Recommendation (LOR) from an observership?",
    answer:
      "Many observership programs offer the possibility of obtaining a Letter of Recommendation, though it is not guaranteed. Programs that commonly provide LORs are marked on our platform. The quality and usefulness of an LOR depends on the duration of your program, your engagement, and the attending physician's willingness to write one. We recommend discussing LOR expectations early in your rotation.",
  },
  {
    question: "How do I find research positions as an IMG?",
    answer:
      "Research positions for IMGs are most commonly found through cold-emailing Principal Investigators (PIs) at academic medical centers. The typical success rate is 2-5%, so plan to send 50-100+ tailored emails. Each email should include your CV, a brief statement of your research interests, and a specific reference to one of the PI's recent publications to show genuine interest. You can also browse research fellowship listings on our platform, check institutional websites for posted positions, and attend medical conferences where you can network with researchers. Departments like Internal Medicine, Oncology, and Public Health tend to have more opportunities for IMGs. A research fellowship of 1-2 years at a US institution can dramatically improve your residency match chances by providing publications, US-based Letters of Recommendation, and insider networking opportunities.",
  },
  {
    question: "What USMLE scores do I need?",
    answer:
      "USMLE Step 1 is now pass/fail, so you simply need to pass. Step 2 CK has become the primary differentiator for residency applications. For Internal Medicine and Family Medicine (the most IMG-accessible specialties), a Step 2 CK score of 230-245 is generally competitive. For moderately competitive specialties like Psychiatry or Neurology, aim for 235-250. For competitive specialties like Surgery or Anesthesiology, you typically need 240-255 or higher. For extremely competitive fields like Dermatology or Orthopedics, scores of 260+ are expected, though these specialties remain nearly inaccessible to most non-US IMGs regardless of score. Keep in mind that scores alone do not determine your match success — US clinical experience, research, LORs, and your personal statement all play critical roles.",
  },
  {
    question: "How important are US clinical experiences for matching?",
    answer:
      "US clinical experience is considered essential for IMGs. Virtually all successfully matched IMGs report having at least one US clinical experience, and most have two or more. US clinical experiences serve multiple purposes: they demonstrate your ability to function in the American healthcare system, provide opportunities for strong US-based Letters of Recommendation, help you understand clinical workflows and documentation practices, and give you networking opportunities with program directors and faculty. Externships with hands-on patient care carry more weight than observerships because they show you can actively participate in patient care. Ideally, your clinical experiences should be in your target specialty and at institutions affiliated with residency programs you plan to apply to. Even a 4-week rotation can make a meaningful difference if you make a strong impression and secure a good LOR.",
  },
  {
    question: "Is this platform free to use?",
    answer:
      "Yes, USCEHub is completely free to use for applicants and will remain free. There are no paywalls, no premium tiers, and no hidden fees. You can browse all listings, read reviews, save favorites, compare programs, and apply to opportunities without any cost. The platform was built by an IMG who went through the entire process and understands the financial burden already placed on international medical graduates. Our goal is to make information accessible to everyone, regardless of their financial situation.",
  },
  {
    question: "What are the most IMG-friendly hospitals?",
    answer:
      "The most IMG-friendly hospitals are concentrated in a few key cities and systems. In New York City, the NYC Health + Hospitals (H+H) system is the largest employer of IMG residents, with programs at Jacobi, Elmhurst, Lincoln, Bellevue, Harlem, Metropolitan, Coney Island, and Queens Hospital Center. Community hospitals in NYC like BronxCare, Maimonides, St. Barnabas, Jamaica Hospital, Brookdale, and Interfaith Medical Center also have high IMG percentages (60-90%). Outside NYC, strong IMG-friendly programs include Cook County/Stroger Hospital in Chicago, Wayne State/Detroit Medical Center in Michigan, Cleveland Clinic community programs in Ohio, and Temple University in Philadelphia. States with the most IMG-friendly programs include New York, Michigan, Illinois, Ohio, Pennsylvania, New Jersey, and Florida. Use FREIDA to filter programs by IMG percentage to build your target list.",
  },
  {
    question: "How do I get Letters of Recommendation from my rotation?",
    answer:
      "Start by discussing LOR expectations with your supervising attending early in your rotation — ideally during the first week. Be proactive and engaged throughout your time: arrive early, stay late, read about your patients' conditions, ask thoughtful questions, and volunteer for presentations or case discussions. Keep a log of interesting cases you were involved in and patients you followed, as this helps the attending write a more specific and personalized letter. Toward the end of your rotation, formally request the LOR and provide the attending with your CV, personal statement, a list of cases you worked on together, and clear instructions on how to submit the letter (usually through ERAS). Give at least 3-4 weeks of lead time before the letter is needed. Always send a thank-you note. If the attending seems hesitant or says they do not know you well enough, it is better to find someone else rather than receive a lukewarm letter, which can hurt your application more than help it.",
  },
  {
    question: "Should I do a research fellowship before applying to residency?",
    answer:
      "A research fellowship can be a powerful strategy, especially if you have gaps in your application. A 1-2 year research position at a US academic institution provides multiple advantages: publications and presentations for your CV, strong US-based Letters of Recommendation from faculty who know you well, J-1 visa status that keeps you in the US, networking with program directors and residents in your target specialty, and familiarity with the US medical system. Research fellowships are particularly valuable if you graduated more than 2-3 years ago (to offset the year-of-graduation gap), if you are targeting a competitive specialty that values research, or if you need time to improve your USMLE scores. However, a research fellowship is not necessary for everyone. If you have strong USMLE scores, recent graduation, good US clinical experience, and are applying to accessible specialties like Internal Medicine or Family Medicine, you may match without one. Consider your individual circumstances, timeline, and financial situation when making this decision.",
  },
  {
    question: "What visa do I need for an observership vs externship?",
    answer:
      "For observerships (shadowing only, no patient contact), most IMGs use a B1/B2 visitor visa. The B1 visa allows you to observe clinical practice as long as you are not providing direct patient care and are not receiving compensation. Some institutions may accept a tourist visa (B2) but the B1 is more appropriate. For externships and hands-on clinical rotations, the visa requirements are more complex. Some institutions require a J-1 visa sponsored through ECFMG or the institution itself. Others may accept students on F-1 visas if the rotation is arranged through their medical school. A few programs may allow hands-on rotations on a B1 visa if the institution's legal department approves it, but this is less common. Always verify the specific visa requirements with the institution before applying and before booking travel. If you are a US permanent resident or citizen, visa requirements do not apply. For research fellowships, a J-1 research scholar visa or H-1B visa is typically required, and the sponsoring institution usually handles the paperwork.",
  },
  {
    question: "How far in advance should I apply?",
    answer:
      "Timing depends on the type of opportunity. For observerships, apply 3-6 months in advance. Popular programs at major academic centers fill up quickly, and some have specific application windows or cohort start dates. For externships and clinical rotations, apply 4-8 months ahead, as these often require additional paperwork including ECFMG verification, immunization records, background checks, and malpractice insurance. For research fellowships, start reaching out to PIs 6-12 months before your desired start date, especially if you need J-1 visa sponsorship (which can take 2-4 months to process). For the residency application itself, begin preparing at least 12-18 months before the ERAS application opens in September. This means starting your USMLE preparation, clinical experiences, and research early enough that everything is in place when application season begins. The most common mistake IMGs make is starting too late — begin planning as early as possible.",
  },
  {
    question: "How are listings verified on the platform?",
    answer:
      "All listings go through our review process before being published. We verify institutional credentials, check NPI numbers when provided, and review the listing content for accuracy and legitimacy. We also display trust badges such as Admin Reviewed, Verified Poster, Institutional Email, and NPI Verified to help you assess listing quality. Community reviews are moderated user-submitted feedback and are separate from source-link verification.",
  },
  {
    question: "Do you offer visa sponsorship or support?",
    answer:
      "USCEHub is a directory platform and does not directly provide visa sponsorship. However, some listed programs offer visa support for participants. Programs that mention visa assistance are tagged accordingly in our listings. You should verify visa requirements and support directly with the institution before applying. Most observerships require a B1/B2 visitor visa.",
  },
  {
    question: "How can my institution list programs on the platform?",
    answer:
      "Institutions can register an account, create an organizational profile, and submit listings through our platform. After registration, you can verify your credentials to receive trust badges that increase visibility. All listings are reviewed by our team before being published. Visit the For Institutions page to learn more about posting opportunities and reaching qualified candidates.",
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Common questions about observerships, externships, and our platform
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-6"
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {faq.question}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
