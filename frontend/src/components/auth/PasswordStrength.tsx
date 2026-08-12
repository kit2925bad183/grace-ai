const REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

export function PasswordStrength({ password }: { password: string }) {
  const score = REQUIREMENTS.filter((r) => r.test(password)).length;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              score >= level
                ? score <= 2
                  ? 'bg-red-400'
                  : score <= 4
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                : 'bg-navy-100'
            }`}
          />
        ))}
      </div>
      <ul className="space-y-1 text-xs text-navy-500">
        {REQUIREMENTS.map((req) => (
          <li
            key={req.label}
            className={req.test(password) ? 'text-emerald-600' : ''}
          >
            {req.test(password) ? '✓' : '○'} {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return REQUIREMENTS.every((r) => r.test(password));
}
