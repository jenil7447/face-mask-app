import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Face Mask Detection CNN',
  description: 'In-browser Deep Learning Inference',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen flex flex-col">
        
        {/* Global Navigation Bar */}
        <nav className="bg-gray-800 p-4 shadow-lg border-b border-gray-700">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="font-extrabold text-xl tracking-tight text-blue-400">
              Mask<span className="text-white">Vision</span>
            </div>
            <div className="flex gap-6 font-medium text-sm text-gray-300">
              <Link href="/" className="hover:text-blue-400 transition-colors">Live Demo</Link>
              <Link href="/dataset" className="hover:text-blue-400 transition-colors">The Dataset</Link>
              <Link href="/architecture" className="hover:text-blue-400 transition-colors">CNN Architecture</Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-grow max-w-5xl mx-auto p-6 w-full">
          {children}
        </main>

      </body>
    </html>
  );
}