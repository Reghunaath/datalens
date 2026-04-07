import { useState } from 'react';

interface InputBarProps {
  disabled: boolean;
  isLoading?: boolean;
  onSubmit?: (query: string) => void;
  onEda?: () => void;
}

export default function InputBar({ disabled, isLoading = false, onSubmit, onEda }: InputBarProps) {
  const [value, setValue] = useState('');

  function handleSubmit() {
    if (!value.trim() || isLoading || disabled) return;
    onSubmit?.(value.trim());
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  const sendDisabled = disabled || isLoading || !value.trim();

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-6 z-30 ${disabled ? 'pointer-events-none select-none opacity-50 grayscale' : ''}`}>
      <div className="max-w-[800px] mx-auto">
        <div
          className={`${disabled ? 'bg-[#151b28] border-slate-800' : 'bg-surface-dark/90 backdrop-blur-xl border-border-dark ring-1 ring-white/10'} border p-2 rounded-full shadow-2xl flex items-center gap-2`}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            className="bg-transparent border-none text-slate-200 placeholder-slate-500 text-sm w-full focus:ring-0 focus:outline-none px-4 font-medium"
            placeholder={
              disabled
                ? 'Upload a CSV to start asking questions...'
                : "Ask a question about your data (e.g., 'Show me sales trends for Q3')"
            }
          />
          {disabled ? (
            <div className="bg-[#20293a] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shrink-0 select-none text-slate-500">
              <span className="material-symbols-outlined text-[14px]">science</span>
              Run EDA
            </div>
          ) : (
            <button
              type="button"
              onClick={onEda}
              disabled={isLoading}
              className="bg-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shrink-0 select-none cursor-pointer hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[14px]">science</span>
              Run EDA
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sendDisabled}
            className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              sendDisabled
                ? 'bg-[#20293a] text-slate-600 cursor-not-allowed opacity-50'
                : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(19,91,236,0.4)] cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isLoading ? 'hourglass_empty' : 'arrow_upward'}
            </span>
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-500 font-medium">DataLens AI can make mistakes. Verify important insights.</p>
        </div>
      </div>
    </div>
  );
}
