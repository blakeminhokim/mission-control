import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Monitor and manage Caesar's scheduled tasks and activity",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Mobile header */}
          <header className="lg:hidden bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
            <h1 className="text-lg font-bold">⚔️ Mission Control</h1>
          </header>
          
          {/* Sidebar - hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
          
          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 z-50">
            <div className="flex justify-around">
              <a href="/" className="flex flex-col items-center p-2 text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-1">Calendar</span>
              </a>
              <a href="/search" className="flex flex-col items-center p-2 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs mt-1">Search</span>
              </a>
              <a href="/activity" className="flex flex-col items-center p-2 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs mt-1">Activity</span>
              </a>
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
