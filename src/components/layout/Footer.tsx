import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <span className="text-2xl font-bold text-white">
                Technimark
                <span className="text-red-500">.</span>
              </span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              Your trusted partner for electronics manufacturing supplies.
              Serving the industry for over 30 years with premium soldering
              equipment, ESD protection, and PCB assembly consumables.
            </p>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300">
              <svg
                className="h-4 w-4 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Veteran Owned &amp; Family Operated
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-800 text-gray-400 transition hover:bg-red-600 hover:text-white"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-800 text-gray-400 transition hover:bg-red-600 hover:text-white"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Get Help */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Get Help
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/faq" className="text-gray-400 transition hover:text-red-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping-policies" className="text-gray-400 transition hover:text-red-400">
                  Shipping Policies
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-400 transition hover:text-red-400">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 transition hover:text-red-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn More */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Learn More
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 transition hover:text-red-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 transition hover:text-red-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-gray-400 transition hover:text-red-400">
                  Brands
                </Link>
              </li>
              <li>
                <Link href="/managed-inventory-program" className="text-gray-400 transition hover:text-red-400">
                  Managed Inventory
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 transition hover:text-red-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-gray-400">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}`} className="transition hover:text-white">
                  {process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href="mailto:sales@technimark-inc.com"
                  className="transition hover:text-white"
                >
                  sales@technimark-inc.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  720 Industrial Dr
                  <br />
                  Cary, IL 60013
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                  Mon&ndash;Fri: 8am&ndash;5pm CST
                  <br />
                  Sat&ndash;Sun: Closed
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-gray-500 md:flex-row">
          <p>
            Copyright &copy; 2018&ndash;{new Date().getFullYear()}{" "}
            Technimark-Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy-policy" className="transition hover:text-gray-300">
              Privacy &amp; Cookie Policy
            </Link>
            <Link href="/search" className="transition hover:text-gray-300">
              Search Terms
            </Link>
            <Link href="/search" className="transition hover:text-gray-300">
              Advanced Search
            </Link>
            <Link href="/orders-returns" className="transition hover:text-gray-300">
              Orders &amp; Returns
            </Link>
            <Link href="/sitemap" className="transition hover:text-gray-300">
              Site Map
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
