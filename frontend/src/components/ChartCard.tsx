import type { ChartResult } from '../types';
import ChartRenderer from './ChartRenderer';

interface ChartCardProps {
  result: ChartResult;
}

const TREND_CONFIG = {
  up: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'trending_up' },
  down: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'trending_down' },
  neutral: { bg: 'bg-slate-500/10', text: 'text-slate-400', icon: 'remove' },
} as const;

export default function ChartCard({ result }: ChartCardProps) {
  const stat = result.summary_stat;
  const trend = stat ? TREND_CONFIG[stat.trend] : null;

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-6 h-full flex flex-col">
      <div className="card-drag-handle cursor-grab active:cursor-grabbing flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-base font-medium text-slate-300">{result.title}</h3>
          {result.subtitle && (
            <p className="text-sm text-slate-500 mt-1">{result.subtitle}</p>
          )}
        </div>
        {stat && trend && (
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            {stat.change && (
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${trend.bg} ${trend.text}`}>
                <span className="material-symbols-outlined text-[14px]">{trend.icon}</span>
                {stat.change}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <ChartRenderer result={result} />
      </div>
    </div>
  );
}
