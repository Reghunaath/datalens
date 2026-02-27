import { useState, useRef, useCallback } from 'react';
import type { UploadResponse } from '../types';
import { uploadFile } from '../services/api';
import axios from 'axios';

interface FileUploadProps {
  onUploadSuccess: (data: UploadResponse) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  }, []);

  async function validateAndUpload(file: File) {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      onUploadSuccess(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Something went wrong uploading the file. Please try again.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="w-full max-w-[640px] flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </div>
          <h1 className="text-white text-4xl font-black tracking-[-0.033em]">
            DataLens
          </h1>
        </div>
        <p className="text-[#9da6b9] text-lg font-normal leading-relaxed max-w-[480px]">
          Upload a CSV and start exploring your data with plain English.
        </p>
      </div>

      <div className="group relative flex flex-col items-center justify-center w-full">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed ${
            isUploading
              ? 'border-primary/50 bg-[#1f2636] pointer-events-none'
              : isDragging
                ? 'border-primary bg-[#1f2636]'
                : 'border-slate-700 bg-[#1a202e] hover:border-primary hover:bg-[#1f2636]'
          } transition-all duration-200 ease-in-out cursor-pointer py-16 px-8 flex flex-col items-center gap-6`}
        >
          {isUploading ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#282e39] flex items-center justify-center text-primary animate-pulse">
                <span className="material-symbols-outlined text-3xl">hourglass_top</span>
              </div>
              <p className="text-slate-300 text-lg font-bold">Uploading...</p>
            </>
          ) : (
            <>
              <div className={`w-16 h-16 rounded-full bg-[#282e39] flex items-center justify-center text-slate-400 ${isDragging ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-white text-lg font-bold">
                  Drag and drop your CSV here
                </p>
                <p className="text-slate-400 text-sm">or</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 h-10 px-6 rounded-full bg-primary hover:bg-blue-600 text-white text-sm font-semibold tracking-wide transition-colors shadow-lg shadow-primary/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">folder_open</span>
                <span>Browse files</span>
              </button>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          Max file size: 10MB
        </p>
      </div>
    </div>
  );
}
