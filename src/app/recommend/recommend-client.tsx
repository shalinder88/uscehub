"use client";

import { useState } from "react";
import {
  DollarSign,
  Stethoscope,
  Globe,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";

type QuizAnswers = {
  budget: string;
  specialty: string;
  visa: string;
  region: string;
};

const STEPS = [
  {
    key: "budget" as const,
    title: "What's your budget?",
    subtitle: "Select the range that works for you",
    icon: DollarSign,
    options: [
      { value: "free", label: "Free programs only", description: "No program fee" },
      { value: "under500", label: "Under $500", description: "Budget-friendly options" },
      { value: "500to1500", label: "$500 - $1,500", description: "Mid-range programs" },
      { value: "1500to3000", label: "$1,500 - $3,000", description: "Premium programs" },
      { value: "any", label: "Any budget", description: "Show all price ranges" },
    ],
  },
  {
    key: "specialty" as const,
    title: "What specialty interests you?",
    subtitle: "Choose your area of interest",
    icon: Stethoscope,
    options: [
      { value: "Internal Medicine", label: "Internal Medicine", description: "Most common for IMGs" },
      { value: "Surgery", label: "Surgery", description: "General and specialized" },
      { value: "Pediatrics", label: "Pediatrics", description: "Children's healthcare" },
      { value: "Cardiology", label: "Cardiology", description: "Heart and vascular" },
      { value: "Oncology", label: "Oncology", description: "Cancer care and research" },
      { value: "Research", label: "Research", description: "Clinical and basic research" },
      { value: "any", label: "Any specialty", description: "Show all specialties" },
    ],
  },
  {
    key: "visa" as const,
    title: "What's your visa status?",
    subtitle: "This helps us find programs that accept your visa type",
    icon: Globe,
    options: [
      { value: "b1b2", label: "B1/B2 Visitor Visa", description: "Tourist/business visa" },
      { value: "j1", label: "J1 Exchange Visa", description: "Exchange visitor" },
      { value: "citizen", label: "US Citizen / Resident", description: "Green card or citizen" },
      { value: "need-support", label: "Need visa support", description: "Show programs with visa help" },
    ],
  },
  {
    key: "region" as const,
    title: "Which region do you prefer?",
    subtitle: "Select your preferred area in the US",
    icon: MapPin,
    options: [
      { value: "northeast", label: "Northeast", description: "NY, MA, PA, NJ, CT, MD..." },
      { value: "midwest", label: "Midwest", description: "IL, OH, MI, MN, IN, WI..." },
      { value: "south", label: "South", description: "TX, FL, GA, NC, VA, TN..." },
      { value: "west", label: "West Coast", description: "CA, WA, OR, CO, AZ..." },
      { value: "any", label: "Any region", description: "No geographic preference" },
    ],
  },
];

interface Listing {
  id: string;
  title: string;
  listingType: string;
  city: string;
  state: string;
  specialty: string;
  duration: string;
  cost: string;
  shortDescription: string;
  certificateOffered: boolean;
  lorPossible: boolean;
  visaSupport: boolean;
  linkVerified?: boolean;
  reviews?: { overallRating: number }[];
}

export default function RecommendClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    budget: "",
    specialty: "",
    visa: "",
    region: "",
  });
  const [results, setResults] = useState<Listing[] | null>(null);
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const showResults = results !== null;

  const selectOption = async (value: string) => {
    const newAnswers = { ...answers, [currentStep.key]: value };
    setAnswers(newAnswers);

    if (isLastStep) {
      // Fetch results
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (newAnswers.budget) params.set("budget", newAnswers.budget);
        if (newAnswers.specialty) params.set("specialty", newAnswers.specialty);
        if (newAnswers.visa) params.set("visa", newAnswers.visa);
        if (newAnswers.region) params.set("region", newAnswers.region);

        const res = await fetch(`/api/recommend?${params.toString()}`);
        const data = await res.json();
        setResults(data.listings || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (showResults) {
      setResults(null);
      return;
    }
    if (step > 0) setStep(step - 1);
  };

  const restart = () => {
    setStep(0);
    setAnswers({ budget: "", specialty: "", visa: "", region: "" });
    setResults(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Finding your best matches...
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="bg-white dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Your Top Matches
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {results.length} {results.length === 1 ? "program" : "programs"}{" "}
              matched your preferences
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Summary of selections */}
          <div className="mb-6 flex flex-wrap gap-2">
            {answers.budget && answers.budget !== "any" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                <DollarSign className="h-3 w-3" />
                {STEPS[0].options.find((o) => o.value === answers.budget)?.label}
              </span>
            )}
            {answers.specialty && answers.specialty !== "any" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Stethoscope className="h-3 w-3" />
                {answers.specialty}
              </span>
            )}
            {answers.visa && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Globe className="h-3 w-3" />
                {STEPS[2].options.find((o) => o.value === answers.visa)?.label}
              </span>
            )}
            {answers.region && answers.region !== "any" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                <MapPin className="h-3 w-3" />
                {STEPS[3].options.find((o) => o.value === answers.region)?.label}
              </span>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-20 text-center">
              <div className="mx-auto max-w-sm">
                <Search className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
                  No exact matches found
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Try broadening your criteria or browse all opportunities.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={restart}>
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const Icon = currentStep.icon;

  return (
    <div className="bg-white dark:bg-slate-900">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Program Finder
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Answer a few questions and we&apos;ll find the best programs for you
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-1.5 rounded-full bg-slate-900 transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {currentStep.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentStep.options.map((option) => (
            <button
              key={option.value}
              onClick={() => selectOption(option.value)}
              className={`w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                answers[currentStep.key] === option.value
                  ? "border-slate-900 bg-slate-50 dark:bg-slate-800 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{option.label}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {option.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Back button */}
        {step > 0 && (
          <div className="mt-6">
            <Button variant="ghost" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
