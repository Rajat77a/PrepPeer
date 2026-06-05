import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const productLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Leaderboard", href: "/#leaderboard-preview" },
  { label: "In action", href: "/#see-it-in-action" },
  { label: "Dashboard", href: "/dashboard" },
];

const companyLinks = ["About", "Blog", "Careers", "Press", "Contact"];
const supportLinks = [
  "Help center",
  "Privacy policy",
  "Terms of service",
  "Cookie policy",
];

const footerLinkHref: Record<string, string> = {
  "Privacy policy": "/privacy",
  "Terms of service": "/terms",
  Privacy: "/privacy",
  Terms: "/terms",
};

export function Footer() {
  return (
    <footer className="bg-[#0A0A0F] px-6 md:px-12 pt-20 pb-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo variant="light" size="md" />
          <p className="font-inter text-[15px] text-white/45 mt-5 max-w-[300px] leading-[1.65]">
            AI mock interviews benchmarked against real peers. Know your rank
            before the real thing.
          </p>
        </div>
        <div>
          <h4 className="font-fustat font-bold text-[15px] text-white mb-5">
            Product
          </h4>
          <ul className="space-y-3">
            {productLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-inter text-sm text-white/45 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-fustat font-bold text-[15px] text-white mb-5">
            Company
          </h4>
          <ul className="space-y-3">
            {companyLinks.map((link) => (
              <li key={link}>
                <span className="font-inter text-sm text-white/45 hover:text-white/80 transition-colors cursor-pointer">
                  {link}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-fustat font-bold text-[15px] text-white mb-5">
            Support
          </h4>
          <ul className="space-y-3">
            {supportLinks.map((link) => (
              <li key={link}>
                {footerLinkHref[link] ? (
                  <Link
                    href={footerLinkHref[link]}
                    className="font-inter text-sm text-white/45 hover:text-white/80 transition-colors cursor-pointer"
                  >
                    {link}
                  </Link>
                ) : (
                  <span className="font-inter text-sm text-white/45 hover:text-white/80 transition-colors cursor-pointer">
                    {link}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-inter text-sm text-white/35">
          © 2026 PrepPeer. All rights reserved.
        </p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Cookies"].map((link) => (
            footerLinkHref[link] ? (
              <Link
                key={link}
                href={footerLinkHref[link]}
                className="font-inter text-sm text-white/35 hover:text-white/60 transition-colors cursor-pointer"
              >
                {link}
              </Link>
            ) : (
              <span
                key={link}
                className="font-inter text-sm text-white/35 hover:text-white/60 transition-colors cursor-pointer"
              >
                {link}
              </span>
            )
          ))}
        </div>
      </div>
    </footer>
  );
}
