export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface border border-border-2 p-6 ${className}`}>{children}</div>;
}

export function Badge({
  children,
  tone = 'lime',
}: {
  children: React.ReactNode;
  tone?: 'lime' | 'coral' | 'muted';
}) {
  const tones = {
    lime: 'bg-lime-muted border-lime/20 text-lime',
    coral: 'bg-coral/10 border-coral/25 text-coral',
    muted: 'bg-surface-2 border-border-2 text-muted',
  };
  return (
    <span className={`inline-block font-mono text-[10px] tracking-wide px-2.5 py-1 border ${tones[tone]}`}>
      {children}
    </span>
  );
}
