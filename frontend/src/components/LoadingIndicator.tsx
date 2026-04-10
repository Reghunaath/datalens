export default function LoadingIndicator() {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex items-center gap-4">
      <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
      <p className="text-sm text-slate-400">Analyzing your data...</p>
    </div>
  );
}
