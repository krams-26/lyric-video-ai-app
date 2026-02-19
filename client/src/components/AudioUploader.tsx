import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  isLoading?: boolean;
}

export default function AudioUploader({ onFileSelect, selectedFile, isLoading }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative p-8 border-2 border-dashed rounded-lg transition ${
        dragActive
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-slate-600 hover:border-purple-500 hover:bg-purple-500/5'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.m4a,.mp4"
        onChange={handleFileChange}
        className="hidden"
        id="audio-file-input"
        disabled={isLoading}
      />

      {selectedFile ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UploadCloud className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-400"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="audio-file-input"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
          <p className="text-white font-medium text-center">
            Cliquez ou glissez votre fichier audio
          </p>
          <p className="text-sm text-gray-400 text-center mt-1">
            MP3, WAV, M4A (max 16MB)
          </p>
        </label>
      )}
    </div>
  );
}
