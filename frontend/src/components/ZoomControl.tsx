interface ZoomControlProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function ZoomControl({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlProps) {
  return (
    <div className="fixed bottom-36 right-6 z-20 flex items-center gap-0.5 bg-surface-dark border border-border-dark rounded-lg px-1 py-1 shadow-lg">
      <button
        onClick={onReset}
        title="Reset zoom (Ctrl+0)"
        className="flex items-center justify-center w-7 h-7 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">fit_screen</span>
      </button>
      <div className="w-px h-4 bg-border-dark mx-0.5" />
      <button
        onClick={onZoomOut}
        title="Zoom out (Ctrl+-)"
        className="flex items-center justify-center w-7 h-7 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">remove</span>
      </button>
      <button
        onClick={onReset}
        title="Reset zoom (Ctrl+0)"
        className="min-w-[3.25rem] h-7 px-2 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 rounded transition-colors"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        title="Zoom in (Ctrl+=)"
        className="flex items-center justify-center w-7 h-7 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
      </button>
    </div>
  );
}
