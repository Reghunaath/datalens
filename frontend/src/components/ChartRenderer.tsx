import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartResult, ChartData } from '../types';

interface ChartRendererProps {
  result: ChartResult;
}

const PALETTE = ['#135bec', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const GRID_COLOR = '#282e39';
const AXIS_COLOR = '#64748b';
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1e293b',
    border: '1px solid #282e39',
    borderRadius: '8px',
  },
  labelStyle: { color: '#ffffff' },
  itemStyle: { color: '#ffffff' },
  cursor: { fill: 'transparent' },
};
const AXIS_TICK = { fill: AXIS_COLOR, fontSize: 12 };
const AXIS_LINE = { stroke: GRID_COLOR };
const LEGEND_STYLE = { color: AXIS_COLOR, fontSize: 12 };

function toRechartsData(data: ChartData): Record<string, string | number>[] {
  return data.labels.map((label, i) => {
    const point: Record<string, string | number> = { name: String(label) };
    data.datasets.forEach((ds) => {
      point[ds.label] = ds.data[i] ?? 0;
    });
    return point;
  });
}

function getColor(datasetIndex: number, colors?: string[]): string {
  return colors?.[0] ?? PALETTE[datasetIndex % PALETTE.length];
}

export default function ChartRenderer({ result }: ChartRendererProps) {
  const { data, options, chart_type } = result;

  const xLabel = options?.xAxisLabel;
  const yLabel = options?.yAxisLabel;

  const xAxisProps = {
    dataKey: 'name' as const,
    tick: AXIS_TICK,
    axisLine: AXIS_LINE,
    tickLine: false as const,
    ...(xLabel ? { label: { value: xLabel, position: 'insideBottom' as const, offset: -5, fill: AXIS_COLOR, fontSize: 12 } } : {}),
  };

  const yAxisProps = {
    tick: AXIS_TICK,
    axisLine: false as const,
    tickLine: false as const,
    ...(yLabel ? { label: { value: yLabel, angle: -90, position: 'insideLeft' as const, fill: AXIS_COLOR, fontSize: 12 } } : {}),
  };

  if (chart_type === 'bar') {
    const chartData = toRechartsData(data);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: xLabel ? 24 : 4, left: yLabel ? 24 : 4 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          {data.datasets.map((ds, i) => (
            <Bar key={ds.label} dataKey={ds.label} fill={getColor(i, ds.colors)} radius={[3, 3, 0, 0]} cursor="default" />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chart_type === 'line') {
    const chartData = toRechartsData(data);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: xLabel ? 24 : 4, left: yLabel ? 24 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          {data.datasets.map((ds, i) => (
            <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={getColor(i, ds.colors)} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chart_type === 'area') {
    const chartData = toRechartsData(data);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: xLabel ? 24 : 4, left: yLabel ? 24 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
          {data.datasets.map((ds, i) => {
            const color = getColor(i, ds.colors);
            return (
              <Area key={ds.label} type="monotone" dataKey={ds.label} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chart_type === 'pie') {
    const pieData = data.labels.map((label, i) => ({
      name: String(label),
      value: data.datasets[0]?.data[i] ?? 0,
    }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} paddingAngle={2}>
            {pieData.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={LEGEND_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chart_type === 'scatter') {
    const scatterData = data.labels.map((label, i) => ({
      x: i,
      y: data.datasets[0]?.data[i] ?? 0,
      name: String(label),
    }));
    const color = getColor(0, data.datasets[0]?.colors);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 4, right: 16, bottom: xLabel ? 24 : 4, left: yLabel ? 24 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="x" type="number" tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
          <YAxis dataKey="y" type="number" {...yAxisProps} />
          <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={scatterData} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
