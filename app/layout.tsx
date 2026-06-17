import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
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
    <html lang="en" className={`${inter.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-[#F0EFE9] text-[#0D1B3E] min-h-screen flex flex-col">
        <header className="bg-navy-dark text-[#F0EFE9] shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            <div className="flex items-center gap-3">
              <a href="https://www.opound.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-0 hover:opacity-90 transition-opacity">
                <span className="font-serif text-[22px] text-[#F0EFE9] border-r-[1.5px] border-[#C8963E] pr-3 mr-3 leading-none">Opound</span>
                <div className="flex flex-col">
                  <span className="font-mono text-[8px] text-[#C8963E] tracking-widest uppercase leading-snug font-medium">Independent</span>
                  <span className="font-mono text-[8px] text-[#C8963E] tracking-widest uppercase leading-snug font-medium">Research</span>
                </div>
              </a>
            </div>
            <nav className="flex items-center gap-4 md:gap-8 font-medium">
              <a href="/" className="text-sm hover:text-[#C8963E] transition-colors">Home</a>
              <a href="/methodology" className="text-sm hover:text-[#C8963E] transition-colors">Methodology</a>
              <a href="/contact" className="text-sm px-4 py-2 border border-[#C8963E] text-[#C8963E] rounded-full hover:bg-[#C8963E] hover:text-[#0D1B3E] transition-all">Contact</a>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <a href="https://www.opound.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-0 hover:opacity-90 transition-opacity">
                  <span className="font-serif text-[22px] text-[#0D1B3E] border-r-[1.5px] border-[#C8963E] pr-3 mr-3 leading-none">Opound</span>
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-[8px] text-[#C8963E] tracking-widest uppercase leading-snug font-medium">Independent</span>
                    <span className="font-mono text-[8px] text-[#C8963E] tracking-widest uppercase leading-snug font-medium">Research</span>
                  </div>
                </a>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">CryptoFIX Auditor</p>
                  <p className="text-xs text-slate-400">
                    <a href="https://www.opound.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C8963E] transition-colors font-medium">Opound LLC</a> — navilla@opound.com
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose font-mono">
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
