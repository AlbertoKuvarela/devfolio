import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <header className="px-8 py-6">
        <Link href="/" className="font-mono text-lime text-sm">
          dev<span className="text-white">folio</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
