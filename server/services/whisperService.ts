import { transcribeAudio } from '../_core/voiceTranscription';

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
}

export interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

/**
 * Transcribe audio and extract lyrics with timestamps
 */
export async function transcribeLyrics(audioUrl: string): Promise<LyricLine[]> {
  try {
    console.log('[Whisper] Transcribing audio:', audioUrl);

    const result = await transcribeAudio({
      audioUrl,
      language: 'fr',
      prompt: 'Transcribe the lyrics of this song',
    });

    // Parse segments into lyric lines
    if (!('segments' in result)) {
      throw new Error('Invalid transcription response');
    }

    const lyricLines: LyricLine[] = (result.segments as any[])
      .filter((segment: any) => segment.text?.trim().length > 0)
      .map((segment: any) => ({
        text: segment.text.trim(),
        startTime: segment.start,
        endTime: segment.end,
      }));

    console.log(`[Whisper] Extracted ${lyricLines.length} lyric lines`);
    return lyricLines;
  } catch (error) {
    console.error('[Whisper] Transcription failed:', error);
    throw error;
  }
}

/**
 * Format lyrics for display (join all text)
 */
export function formatLyricsText(lyrics: LyricLine[]): string {
  return lyrics.map((line: LyricLine) => line.text).join('\n');
}
