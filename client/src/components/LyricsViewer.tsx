import { useEffect, useState } from 'react';

interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

interface LyricsViewerProps {
  lyrics: LyricLine[];
  currentTime: number;
  onLyricClick?: (line: LyricLine) => void;
}

export default function LyricsViewer({ lyrics, currentTime, onLyricClick }: LyricsViewerProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    const index = lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    );
    setCurrentLineIndex(index);
  }, [currentTime, lyrics]);

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {lyrics.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Aucune parole disponible</p>
      ) : (
        lyrics.map((line, index) => (
          <div
            key={index}
            onClick={() => onLyricClick?.(line)}
            className={`p-3 rounded-lg cursor-pointer transition ${
              index === currentLineIndex
                ? 'bg-purple-600 text-white scale-105'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <p className="font-medium">{line.text}</p>
            <p className="text-xs opacity-70">
              {line.startTime.toFixed(2)}s - {line.endTime.toFixed(2)}s
            </p>
          </div>
        ))
      )}
    </div>
  );
}
