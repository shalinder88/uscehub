import Link from "next/link";
import { HeartPulse } from "lucide-react";

const linkClass = "text-sm text-muted transition-colors hover:text-foreground";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-accent" />
              <span className="text-base font-bold text-foreground">USCEHub</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              The IMG career operating system — from USCE to residency to attending career. Verified data, structured intelligence, one platform.
            </p>
          </div>

          {/* USCE */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">USCE</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/browse" className={linkClass}>Browse Programs</Link></li>
              <li><Link href="/observerships" className={linkClass}>Browse by State</Link></li>
              <li><Link href="/recommend" className={linkClass}>Program Finder</Link></li>
              <li><Link href="/compare" className={linkClass}>Compare</Link></li>
              <li><Link href="/img-resources" className={linkClass}>IMG Resources</Link></li>
              <li><Link href="/community" className={linkClass}>Community</Link></li>
            </ul>
          </div>

          {/* Residency */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Residency</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/residency" className={linkClass}>Overview</Link></li>
              <li><Link href="/residency/resources" className={linkClass}>Teaching Resources</Link></li>
              <li><Link href="/residency/fellowship" className={linkClass}>Fellowship Database</Link></li>
              <li><Link href="/residency/boards" className={linkClass}>Board Prep</Link></li>
              <li><Link href="/residency/survival" className={linkClass}>Survival Guide</Link></li>
              <li><Link href="/residency/community" className={linkClass}>Community</Link></li>
            </ul>
          </div>

          {/* Career */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Career</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/career" className={linkClass}>Overview</Link></li>
              <li><Link href="/career/jobs" className={linkClass}>Waiver Jobs</Link></li>
              <li><Link href="/career/waiver" className={linkClass}>State Intelligence</Link></li>
              <li><Link href="/career/lawyers" className={linkClass}>Lawyers</Link></li>
              <li><Link href="/career/offers" className={linkClass}>Offer Compare</Link></li>
              <li><Link href="/career/citizenship" className={linkClass}>Citizenship</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className={linkClass}>About</Link></li>
              <li><Link href="/methodology" className={linkClass}>Methodology</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
              <li><Link href="/disclaimer" className={linkClass}>Disclaimer</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted">
            USCEHub is an educational and informational platform. We are not affiliated with NRMP, ECFMG, ERAS, or AAMC. All trademarks belong to their respective owners. All data is verified where possible — unverified data is clearly labeled. Users must verify all information independently.
          </p>
          <p className="mt-3 text-xs text-muted">
            &copy; {new Date().getFullYear()} USCEHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
