import type { InsightResult } from '../types';

interface InsightCardProps {
  result: InsightResult;
}

const VARIANT_CONFIG = {
  info: {
    color: '#135bec',
    icon: 'auto_awesome',
    label: 'AI INSIGHT',
  },
  warning: {
    color: '#f59e0b',
    icon: 'lightbulb',
    label: 'WARNING',
  },
  success: {
    color: '#10b981',
    icon: 'check_circle',
    label: 'SUCCESS',
  },
} as const;

export default function InsightCard({ result }: InsightCardProps) {
  const config = VARIANT_CONFIG[result.variant];

  return (
    <div className="card-drag-handle cursor-grab active:cursor-grabbing bg-surface-dark border border-border-dark rounded-xl p-6 flex gap-4">
      <div
        className="w-1 rounded-full self-stretch flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <div
        className="size-10 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: `${config.color}26` }}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ color: config.color }}
        >
          {config.icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: config.color }}
        >
          {config.label}
        </p>
        <h3 className="text-lg font-semibold text-slate-100 mt-1">{result.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mt-2">{result.content}</p>
      </div>
    </div>
  );
}
