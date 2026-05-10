import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-mono',
});

export const metadata: Metadata = {
  title: "CryptoFIX Institutional Readiness Auditor",
  description: "Score any crypto exchange FIX implementation against TradFi institutional standards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased bg-slate-50 min-h-screen flex flex-col">
        <header className="bg-navy-dark text-white shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10 shadow-sm">
                <rect width="100" height="100" rx="25" fill="#10B981"/>
                <text x="50" y="53" font-family="sans-serif" font-weight="bold" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">O</text>
              </svg>
              <div>
                <a href="https://www.opound.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#10B981] transition-colors">
                  <h1 className="text-xl font-bold tracking-tight">Opound LLC</h1>
                </a>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold -mt-1">CryptoFIX Auditor</p>
              </div>
            </div>
            <nav className="flex items-center gap-4 md:gap-8">
              <a href="/" className="text-sm font-semibold hover:text-[#10B981] transition-colors">Home</a>
              <a href="/methodology" className="text-sm font-semibold hover:text-[#10B981] transition-colors">Methodology</a>
              <a href="/contact" className="text-sm font-semibold px-4 py-2 border border-[#10B981] text-[#10B981] rounded-full hover:bg-[#10B981] hover:text-white transition-all">Contact</a>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                  <rect width="100" height="100" rx="25" fill="#10B981"/>
                  <text x="50" y="53" font-family="sans-serif" font-weight="bold" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">O</text>
                </svg>
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">CryptoFIX Auditor</p>
                  <p className="text-xs text-slate-400"><a href="https://www.opound.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#10B981] transition-colors">Opound LLC</a> — navilla@opound.com</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose">
                  Methodology based on FIX Trading Community standards<br />
                  and Digital Asset Working Group (DAWG) EP273
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
