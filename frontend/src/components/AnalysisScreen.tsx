import { useState } from 'react';
import type { FileMetadata, ResultItem, QueryResponse } from '../types';
import { runEda, sendQuery } from '../services/api';
import TopBar from './TopBar';
import InputBar from './InputBar';
import ResultsFeed from './ResultsFeed';

interface AnalysisScreenProps {
  fileMetadata: FileMetadata;
  onUploadNew: () => void;
}

export default function AnalysisScreen({ fileMetadata, onUploadNew }: AnalysisScreenProps) {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(query: string) {
    setIsLoading(true);
    try {
      const response = await sendQuery(query);
      const data: QueryResponse = response.data;
      setResults((prev) => [...prev, ...data.results]);
    } catch {
      setResults((prev) => [
        ...prev,
        {
          type: 'insight',
          variant: 'warning',
          title: 'Error',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEda() {
    setIsLoading(true);
    try {
      const response = await runEda();
      const data: QueryResponse = response.data;
      setResults((prev) => [...prev, ...data.results]);
    } catch {
      setResults((prev) => [
        ...prev,
        {
          type: 'insight',
          variant: 'warning',
          title: 'EDA Error',
          content: 'Something went wrong running the EDA. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col overflow-hidden">
      <TopBar fileMetadata={fileMetadata} onUploadNew={onUploadNew} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-32">
        <div className="flex justify-center w-full px-4 md:px-8 py-8">
          <ResultsFeed results={results} isLoading={isLoading} />
        </div>
      </main>
      <InputBar disabled={false} isLoading={isLoading} onSubmit={handleSubmit} onEda={handleEda} />
    </div>
  );
}
