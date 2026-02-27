import { useState } from 'react';
import type { UploadResponse, FileMetadata } from './types';
import FileUpload from './components/FileUpload';
import AnalysisScreen from './components/AnalysisScreen';
import InputBar from './components/InputBar';

export default function App() {
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);

  function handleUploadSuccess(data: UploadResponse) {
    setFileMetadata({
      filename: data.filename,
      rows: data.rows,
      columns: data.columns,
      column_info: data.column_info,
    });
  }

  function handleUploadNew() {
    setFileMetadata(null);
  }

  if (fileMetadata) {
    return <AnalysisScreen fileMetadata={fileMetadata} onUploadNew={handleUploadNew} />;
  }

  return (
    <div className="bg-background-upload min-h-screen flex flex-col items-center justify-center p-4 relative pb-28">
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      <InputBar disabled={true} />
    </div>
  );
}
