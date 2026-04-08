import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import type { ResultItem, CardLayout } from '../types';
import InsightCard from './InsightCard';
import TableCard from './TableCard';
import ChartCard from './ChartCard';
import LoadingIndicator from './LoadingIndicator';

interface ResultsFeedProps {
  results: ResultItem[];
  isLoading: boolean;
}

const DEFAULT_SIZES: Record<ResultItem['type'], { width: number; height: number }> = {
  insight: { width: 420, height: 160 },
  chart: { width: 560, height: 420 },
  table: { width: 600, height: 320 },
};

const GAP = 24;
// Two-column masonry: col 0 starts at x=20, col 1 starts after the widest card + gap
const COL_STARTS = [20, 650] as const;
// Cards with x < this threshold are considered to be in col 0
const COL_THRESHOLD = 400;

const RESIZE_HANDLES = {
  bottom: 'resize-handle',
  right: 'resize-handle',
  bottomRight: 'resize-handle',
};

export default function ResultsFeed({ results, isLoading }: ResultsFeedProps) {
  const [layouts, setLayouts] = useState<CardLayout[]>([]);

  useEffect(() => {
    setLayouts((prev) => {
      if (results.length === 0) return prev.length === 0 ? prev : [];
      if (results.length <= prev.length) return prev;

      // Derive current column heights from already-placed cards
      const colY: [number, number] = [20, 20];
      for (const l of prev) {
        const col = l.x < COL_THRESHOLD ? 0 : 1;
        colY[col] = Math.max(colY[col], l.y + l.height + GAP);
      }

      const next = [...prev];
      for (let i = prev.length; i < results.length; i++) {
        const sizes = DEFAULT_SIZES[results[i].type];
        // Place in the shorter column (masonry)
        const col = colY[0] <= colY[1] ? 0 : 1;
        next.push({
          id: `card-${i}`,
          x: COL_STARTS[col],
          y: colY[col],
          width: sizes.width,
          height: sizes.height,
        });
        colY[col] += sizes.height + GAP;
      }
      return next;
    });
  }, [results]);

  const updateLayout = (index: number, updates: Partial<CardLayout>) => {
    setLayouts((prev) => prev.map((l, i) => (i === index ? { ...l, ...updates } : l)));
  };

  if (results.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm w-full">
        Ask a question about your data to get started.
      </div>
    );
  }

  const canvasHeight = layouts.reduce((max, l) => Math.max(max, l.y + l.height + 60), 600);

  return (
    <div className="relative w-full" style={{ height: canvasHeight }}>
      {results.map((item, index) => {
        const layout = layouts[index];
        if (!layout) return null;
        return (
          <Rnd
            key={layout.id}
            className="rnd-card"
            size={{ width: layout.width, height: layout.height }}
            position={{ x: layout.x, y: layout.y }}
            onDragStop={(_, d) => updateLayout(index, { x: d.x, y: d.y })}
            onResizeStop={(_, __, ref, ___, position) =>
              updateLayout(index, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                ...position,
              })
            }
            bounds="parent"
            dragHandleClassName="card-drag-handle"
            minWidth={280}
            minHeight={120}
            enableResizing={{ bottom: true, right: true, bottomRight: true }}
            resizeHandleClasses={RESIZE_HANDLES}
          >
            {item.type === 'insight' && <InsightCard result={item} />}
            {item.type === 'table' && <TableCard result={item} />}
            {item.type === 'chart' && <ChartCard result={item} />}
          </Rnd>
        );
      })}
      {isLoading && (
        <div className="absolute" style={{ left: 20, top: canvasHeight - 60 }}>
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
}
