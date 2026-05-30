import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'MaskVision — In-Browser Face Mask Detection',
  description: 'Real-time face mask detection running entirely in the browser using ONNX Runtime Web.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#080c14] text-white min-h-screen flex flex-col">

        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b border-gray-800/80 bg-[#080c14]/90 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <span className="text-black font-display font-black text-sm">M</span>
              </div>
              <span className="font-display font-black text-lg tracking-tight">
                Mask<span className="text-teal-400">Vision</span>
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {[
                { href: '/', label: 'Live Demo' },
                { href: '/dataset', label: 'Dataset' },
                { href: '/architecture', label: 'Architecture' },
                { href: '/training', label: 'Training' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg font-mono text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Page */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/60 py-10 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-display font-black text-gray-600">
              Mask<span className="text-gray-500">Vision</span>
            </div>
            <div className="text-xs font-mono text-gray-700 text-center">
              PyTorch · ONNX Runtime Web · Next.js · Edge Inference · 97.47% Val Accuracy
            </div>
            <div className="text-xs font-mono text-gray-700">
              Trained on Kaggle · CC0 Dataset
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}