import { useState } from 'react';
import { Bot, X, Send, MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

const CITIZEN_PROMPTS = [
  'Where is my complaint?',
  'Why is my complaint delayed?',
  'How do I report an issue?',
];

const AUTHORITY_PROMPTS = [
  'Which ward has the most complaints?',
  'Show critical SLA cases',
  'Which department needs attention?',
];

interface GraceAssistantProps {
  role?: 'citizen' | 'authority';
}

export function GraceAssistant({ role = 'citizen' }: GraceAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: role === 'citizen'
        ? 'Hi! I\'m GRACE. Ask me about reporting issues, tracking complaints, or understanding your status.'
        : 'Hi! I\'m GRACE. Ask me about SLA cases, department workload, or navigating the command center.',
    },
  ]);

  const prompts = role === 'citizen' ? CITIZEN_PROMPTS : AUTHORITY_PROMPTS;

  const respond = (text: string) => {
    const n = text.toLowerCase();
    let reply = role === 'citizen'
      ? 'Go to Report Issue to submit a complaint, or Track to check progress. Your Updates tab shows notifications.'
      : 'Check the Overview for needs-attention cases, SLA Monitor for deadlines, and Analytics for trends.';

    if (n.includes('where') || n.includes('track') || n.includes('complaint')) {
      reply = role === 'citizen'
        ? 'Open My Complaints or enter your complaint ID on Track. You\'ll see a simple progress journey for each issue.'
        : 'Use the Complaints page to search by ID. The live queue on Overview shows the most recent cases.';
    } else if (n.includes('delay') || n.includes('attention') || n.includes('sla') || n.includes('critical')) {
      reply = role === 'citizen'
        ? 'If your complaint says "May need attention soon," the department is still working on it. Check Updates for new messages.'
        : 'Open SLA Monitor for cases at risk. Critical and approaching-deadline counts are on the Overview dashboard.';
    } else if (n.includes('report') || n.includes('submit')) {
      reply = 'Tap Report Issue, describe what happened step by step, then Analyze with GRACE AI before submitting.';
    } else if (n.includes('ward') || n.includes('department')) {
      reply = role === 'authority'
        ? 'Analytics and Insights pages show ward hotspots and department performance from live data.'
        : 'GRACE routes your complaint to the right department automatically based on the issue type.';
    }

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text },
      { id: `a-${Date.now()}`, role: 'assistant', text: reply },
    ]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    respond(text);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-20 right-4 z-40 flex min-h-[48px] items-center gap-2 rounded-full bg-civic-primary px-5 py-3 text-base font-semibold text-white shadow-elevated transition hover:bg-teal-800 lg:bottom-6',
          open && 'pointer-events-none opacity-0'
        )}
        aria-label="Ask GRACE"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Ask GRACE
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-end sm:p-6">
          <button type="button" className="absolute inset-0 bg-civic-text/30 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="relative flex h-[min(560px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-civic-border bg-white shadow-elevated animate-slide-up">
            <div className="flex items-center justify-between border-b border-civic-border bg-civic-mint px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-civic-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-civic-text">Ask GRACE</p>
                  <p className="text-xs text-civic-muted">Here to help</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="min-h-[44px] min-w-[44px] rounded-xl p-2 hover:bg-white/60" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={cn('max-w-[90%] rounded-2xl px-4 py-3 text-base', m.role === 'assistant' ? 'bg-civic-mint/60 text-civic-text' : 'ml-auto bg-civic-primary text-white')}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="border-t border-civic-border p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {prompts.map((p) => (
                  <button key={p} type="button" onClick={() => respond(p)} className="rounded-full border border-civic-border px-3 py-1.5 text-xs text-civic-muted hover:bg-civic-mint/50">
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="input-field flex-1" aria-label="Message" />
                <button type="button" onClick={handleSend} className="btn-primary min-w-[48px] px-3" aria-label="Send">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
