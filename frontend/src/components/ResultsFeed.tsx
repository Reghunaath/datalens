import { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import type { ResultItem, CardLayout } from '../types';
import InsightCard from './InsightCard';
import TableCard from './TableCard';
import ChartCard from './ChartCard';
import ZoomControl from './ZoomControl';

interface ResultsFeedProps {
  results: ResultItem[];
  isLoading: boolean;
}

const DEFAULT_SIZES: Record<ResultItem['type'], { width: number; height: number }> = {
  insight: { width: 420, height: 180 },
  chart: { width: 560, height: 420 },
  table: { width: 600, height: 320 },
};

// Heights used only for masonry column tracking (insight is auto-height so we use an estimate)
const MASONRY_HEIGHTS: Record<ResultItem['type'], number> = {
  insight: 180,
  chart: 420,
  table: 320,
};

const GAP = 24;
// Block width = widest left-column card + gap + widest right-column card
const BLOCK_WIDTH = DEFAULT_SIZES.table.width + GAP + DEFAULT_SIZES.chart.width; // 1184

const RESIZE_HANDLES = {
  bottom: 'resize-handle',
  right: 'resize-handle',
  bottomRight: 'resize-handle',
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export default function ResultsFeed({ results, isLoading }: ResultsFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layouts, setLayouts] = useState<CardLayout[]>([]);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);

  const zoomIn  = useCallback(() => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2)))), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2)))), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  const closeCard = (id: string) =>
    setClosedIds((prev) => new Set([...prev, id]));

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
        if (e.key === '-')                  { e.preventDefault(); zoomOut(); }
        if (e.key === '0')                  { e.preventDefault(); resetZoom(); }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [zoomIn, zoomOut, resetZoom]);

  useEffect(() => {
    setLayouts((prev) => {
      if (results.length === 0) {
        if (prev.length !== 0) setZoom(1);
        return prev.length === 0 ? prev : [];
      }
      if (results.length <= prev.length) return prev;

      // Center the two-column block within the actual container width
      const containerWidth = containerRef.current?.offsetWidth ?? 1200;
      const margin = Math.max(20, Math.floor((containerWidth - BLOCK_WIDTH) / 2));
      const col0X = margin;
      const col1X = margin + DEFAULT_SIZES.table.width + GAP;
      const colXStarts: [number, number] = [col0X, col1X];
      const threshold = (col0X + col1X) / 2;

      // Derive current column heights from already-placed cards
      const colY: [number, number] = [20, 20];
      for (const l of prev) {
        const col = l.x < threshold ? 0 : 1;
        colY[col] = Math.max(colY[col], l.y + l.height + GAP);
      }

      const next = [...prev];
      for (let i = prev.length; i < results.length; i++) {
        const type = results[i].type;
        const sizes = DEFAULT_SIZES[type];
        const masonryH = MASONRY_HEIGHTS[type];
        const col = colY[0] <= colY[1] ? 0 : 1;
        next.push({
          id: `card-${i}`,
          x: colXStarts[col],
          y: colY[col],
          width: sizes.width,
          height: sizes.height,
        });
        colY[col] += masonryH + GAP;
      }
      return next;
    });
  }, [results]);

  const updateLayout = (index: number, updates: Partial<CardLayout>) => {
    setLayouts((prev) => prev.map((l, i) => (i === index ? { ...l, ...updates } : l)));
  };

  const canvasHeight = layouts.reduce((max, l) => Math.max(max, l.y + l.height + 60), 600);

  return (
    <div ref={containerRef} className="w-full relative">
      {results.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
          Ask a question about your data to get started.
        </div>
      ) : (
        <>
          {/* Height shim — reserves scroll space matching scaled canvas height */}
          <div style={{ height: canvasHeight * zoom, width: '100%', pointerEvents: 'none' }} />
          {/* Scale wrapper */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${100 / zoom}%`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 150ms ease',
            }}
          >
            <div className="relative w-full" style={{ height: canvasHeight }}>
              {results.map((item, index) => {
                const layout = layouts[index];
                if (!layout || closedIds.has(layout.id)) return null;
                return (
                  <Rnd
                    key={layout.id}
                    className="rnd-card"
                    size={{
                      width: layout.width,
                      height: item.type === 'insight' ? 'auto' : layout.height,
                    }}
                    position={{ x: layout.x, y: layout.y }}
                    scale={zoom}
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
                    enableResizing={
                      item.type === 'insight'
                        ? { right: true }
                        : { bottom: true, right: true, bottomRight: true }
                    }
                    resizeHandleClasses={RESIZE_HANDLES}
                  >
                    <div className={`relative group ${item.type !== 'insight' ? 'h-full' : ''}`}>
                      {item.type === 'insight' && <InsightCard result={item} />}
                      {item.type === 'table' && <TableCard result={item} />}
                      {item.type === 'chart' && <ChartCard result={item} />}
                      <button
                        className="absolute top-2 right-2 z-10 flex items-center justify-center text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => closeCard(layout.id)}
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  </Rnd>
                );
              })}
            </div>
          </div>
          <ZoomControl zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
        </>
      )}
    </div>
  );
}
