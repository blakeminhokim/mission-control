import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Monitor and manage Caesar's scheduled tasks and activity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#06080d] text-gray-200 min-h-screen`}>
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Mobile header */}
          <header className="lg:hidden glass-strong sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="font-semibold text-white text-sm tracking-tight">Mission Control</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="text-[11px] text-gray-500">Connected</span>
            </div>
          </header>

          {/* Sidebar - desktop only */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-grid">{children}</main>

          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-strong z-50 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-1">
              <a href="/" className="flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-colors text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span className="text-[10px] font-medium">Dashboard</span>
              </a>
              <a href="/activity" className="flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-colors text-gray-500 hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
                <span className="text-[10px] font-medium">Activity</span>
              </a>
              <a href="/search" className="flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-colors text-gray-500 hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span className="text-[10px] font-medium">Search</span>
              </a>
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
