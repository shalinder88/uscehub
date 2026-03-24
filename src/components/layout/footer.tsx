import Link from "next/link";
import { HeartPulse } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-slate-800 dark:text-slate-200" />
              <span className="text-base font-bold text-slate-900 dark:text-white">
                USCEHub
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              The largest structured database of clinical observership, externship,
              and research opportunities for International Medical Graduates in the
              United States.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/browse"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link
                  href="/observerships"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Browse by State
                </Link>
              </li>
              <li>
                <Link
                  href="/recommend"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Program Finder
                </Link>
              </li>
              <li>
                <Link
                  href="/img-resources"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  IMG Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/for-institutions"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  For Institutions & Physicians
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Methodology
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Recommended Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Resources</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://www.ecfmg.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  ECFMG
                </a>
              </li>
              <li>
                <a
                  href="https://www.usmle.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  USMLE
                </a>
              </li>
              <li>
                <a
                  href="https://www.nrmp.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  NRMP
                </a>
              </li>
              <li>
                <a
                  href="https://eras.aamc.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  ERAS
                </a>
              </li>
              <li>
                <Link
                  href="/img-resources"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  IMG Resources & Data
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/disclaimer"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-6">
          <p className="text-xs leading-relaxed text-slate-400">
            USCEHub is an educational and informational platform. We are
            not affiliated with NRMP, ECFMG, ERAS, or AAMC. All trademarks belong
            to their respective owners. Listings are submitted by third-party
            institutions and individuals. We do not guarantee the accuracy,
            completeness, or validity of any listing. Users are advised to verify
            all information independently before applying or making payments.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} USCEHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
