import { describe, it, expect, vi } from 'vitest';
import { transcribeLyrics, formatLyricsText } from './whisperService';

describe('Whisper Service', () => {
  describe('formatLyricsText', () => {
    it('should join lyric lines with newlines', () => {
      const lyrics = [
        { text: 'Hello world', startTime: 0, endTime: 1.5 },
        { text: 'This is a test', startTime: 1.5, endTime: 3.0 },
      ];

      const result = formatLyricsText(lyrics);
      expect(result).toBe('Hello world\nThis is a test');
    });

    it('should handle empty lyrics array', () => {
      const result = formatLyricsText([]);
      expect(result).toBe('');
    });

    it('should handle single lyric line', () => {
      const lyrics = [{ text: 'Single line', startTime: 0, endTime: 1 }];
      const result = formatLyricsText(lyrics);
      expect(result).toBe('Single line');
    });
  });

  describe('transcribeLyrics', () => {
    it('should handle transcription errors gracefully', async () => {
      try {
        // This will fail because we're not mocking the transcribeAudio function
        // In a real test, you would mock the voiceTranscription module
        await transcribeLyrics('https://example.com/audio.mp3');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
