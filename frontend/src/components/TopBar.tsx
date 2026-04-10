import { downloadCsv } from '../services/api';
import type { FileMetadata } from '../types';

interface TopBarProps {
  fileMetadata: FileMetadata;
  onUploadNew: () => void;
}

export default function TopBar({ fileMetadata, onUploadNew }: TopBarProps) {
  async function handleDownload() {
    const response = await downloadCsv();
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleUploadNew() {
    if (window.confirm('This will clear your current session. Are you sure?')) {
      onUploadNew();
    }
  }

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark bg-background-dark px-6 py-4 z-20 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">data_usage</span>
          <h2 className="text-white text-lg font-bold tracking-tight">DataLens</h2>
        </div>
        <div className="h-4 w-px bg-border-dark mx-2"></div>
        <p className="text-slate-400 text-sm font-medium">{fileMetadata.filename}</p>
        <span className="text-slate-600 text-xs font-bold px-1">&middot;</span>
        <p className="text-slate-500 text-sm">{fileMetadata.rows.toLocaleString()} rows</p>
        <span className="text-slate-600 text-xs font-bold px-1">&middot;</span>
        <p className="text-slate-500 text-sm">{fileMetadata.columns} columns</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleUploadNew}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 hover:bg-surface-dark text-slate-300 text-sm font-medium transition-colors border border-transparent hover:border-border-dark cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>Upload New</span>
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 hover:bg-surface-dark text-slate-300 text-sm font-medium transition-colors border border-transparent hover:border-border-dark cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Download CSV</span>
        </button>
      </div>
    </header>
  );
}
