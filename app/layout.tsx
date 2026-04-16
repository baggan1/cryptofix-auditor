import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 min-h-screen flex flex-col">
        <header className="bg-navy-dark text-white shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-navy-dark text-xl">
                O
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Opound LLC</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold -mt-1">CryptoFIX Auditor</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
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
              <div className="text-center md:text-left">
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">CryptoFIX Auditor</p>
                <p className="text-xs text-slate-400">Opound LLC — navilla@opound.com</p>
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
