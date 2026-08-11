import { Shield } from 'lucide-react';

interface PhasePlaceholderProps {
  title: string;
  description: string;
  phase: string;
}

export default function PhasePlaceholder({ title, description, phase }: PhasePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy-900">
        <Shield className="h-7 w-7 text-grace-cyan" />
      </div>
      <h2 className="text-xl font-bold text-navy-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-navy-600">{description}</p>
      <span className="mt-4 inline-flex rounded-full bg-grace-cyan/10 px-3 py-1 text-xs font-medium text-grace-cyan">
        {phase}
      </span>
    </div>
  );
}
