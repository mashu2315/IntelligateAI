import "./globals.css";

export const metadata = {
  title: "IntelliGate - AI-Enhanced GaaS",
  description: "Gateway-as-a-Service with Intelligent Traffic Optimization",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col selection:bg-purple-200">
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center">
                <span className="text-white font-bold text-lg">IG</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">IntelliGate</span>
            </div>
            <nav>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Documentation
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
