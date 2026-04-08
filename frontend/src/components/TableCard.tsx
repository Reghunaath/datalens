import type { TableResult } from '../types';

interface TableCardProps {
  result: TableResult;
}

export default function TableCard({ result }: TableCardProps) {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden h-full flex flex-col">
      <div className="card-drag-handle cursor-grab active:cursor-grabbing px-6 py-4 border-b border-border-dark flex-shrink-0">
        <h3 className="text-base font-medium text-slate-300">{result.title}</h3>
      </div>
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full">
          <thead>
            <tr>
              {result.headers.map((header) => (
                <th
                  key={header}
                  className="text-xs uppercase font-semibold text-slate-500 px-6 py-3 text-left whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-white/5 transition-colors ${rowIndex % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`text-sm text-slate-300 px-6 py-3 ${typeof cell === 'number' ? 'font-mono' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
