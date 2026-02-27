export interface ColumnInfo {
  name: string;
  dtype: string;
  sample_values: (string | number)[];
}

export interface UploadResponse {
  status: string;
  filename: string;
  rows: number;
  columns: number;
  column_info: ColumnInfo[];
  preview: (string | number)[][];
}

export interface SummaryStat {
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartDataset {
  label: string;
  data: number[];
  colors: string[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface InsightResult {
  type: 'insight';
  variant: 'info' | 'warning' | 'success';
  title: string;
  content: string;
}

export interface ChartResult {
  type: 'chart';
  chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  title: string;
  subtitle?: string;
  summary_stat?: SummaryStat;
  data: ChartData;
  options?: ChartOptions;
  layout?: 'half';
}

export interface TableResult {
  type: 'table';
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export type ResultItem = InsightResult | ChartResult | TableResult;

export interface QueryResponse {
  status: string;
  results: ResultItem[];
  dataset_modified: boolean;
}

export interface FileMetadata {
  filename: string;
  rows: number;
  columns: number;
  column_info: ColumnInfo[];
}
