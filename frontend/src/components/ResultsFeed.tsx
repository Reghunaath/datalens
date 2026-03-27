import type { ResultItem, ChartResult } from '../types';
import InsightCard from './InsightCard';
import TableCard from './TableCard';
import ChartCard from './ChartCard';
import LoadingIndicator from './LoadingIndicator';

interface ResultsFeedProps {
  results: ResultItem[];
  isLoading: boolean;
}

export default function ResultsFeed({ results, isLoading }: ResultsFeedProps) {
  if (results.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[960px] gap-6">
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
          Ask a question about your data to get started.
        </div>
      </div>
    );
  }

  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < results.length) {
    const item = results[i];

    // Side-by-side layout: pair consecutive half-layout charts
    if (item.type === 'chart' && item.layout === 'half') {
      const next = results[i + 1];
      if (next && next.type === 'chart' && next.layout === 'half') {
        nodes.push(
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard result={item as ChartResult} />
            <ChartCard result={next as ChartResult} />
          </div>
        );
        i += 2;
        continue;
      }
    }

    if (item.type === 'insight') {
      nodes.push(<InsightCard key={i} result={item} />);
    } else if (item.type === 'table') {
      nodes.push(<TableCard key={i} result={item} />);
    } else if (item.type === 'chart') {
      nodes.push(<ChartCard key={i} result={item} />);
    }

    i += 1;
  }

  return (
    <div className="flex flex-col w-full max-w-[960px] gap-6">
      {nodes}
      {isLoading && <LoadingIndicator />}
    </div>
  );
}
