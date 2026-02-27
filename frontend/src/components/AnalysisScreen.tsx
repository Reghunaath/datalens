import type { FileMetadata } from '../types';
import TopBar from './TopBar';
import InputBar from './InputBar';
import ResultsFeed from './ResultsFeed';

interface AnalysisScreenProps {
  fileMetadata: FileMetadata;
}

export default function AnalysisScreen({ fileMetadata }: AnalysisScreenProps) {
  return (
    <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col overflow-hidden">
      <TopBar fileMetadata={fileMetadata} />
      <main className="flex-1 overflow-y-auto relative pb-32">
        <div className="flex justify-center w-full px-4 md:px-8 py-8">
          <ResultsFeed results={[]} />
        </div>
      </main>
      <InputBar disabled={false} />
    </div>
  );
}
