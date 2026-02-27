import type { ResultItem } from '../types';

interface ResultsFeedProps {
  results: ResultItem[];
}

export default function ResultsFeed({ results }: ResultsFeedProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col w-full max-w-[960px] gap-6">
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
          Ask a question about your data to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[960px] gap-6">
      {/* Result cards will be rendered here in later steps */}
    </div>
  );
}
