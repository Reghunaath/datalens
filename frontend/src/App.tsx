import { useEffect } from 'react';
import FileUpload from './components/FileUpload';
import InputBar from './components/InputBar';
import { healthCheck } from './services/api';

export default function App() {
  useEffect(() => {
    healthCheck()
      .then((res) => console.log('Health check:', res.data))
      .catch((err) => console.error('Health check failed:', err));
  }, []);

  return (
    <div className="bg-background-upload min-h-screen flex flex-col items-center justify-center p-4 relative pb-28">
      <FileUpload onUploadSuccess={() => {}} />
      <InputBar disabled={true} />
    </div>
  );
}
