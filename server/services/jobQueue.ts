import { createProcessingJob, updateProcessingJob, getPendingJobs, getProjectById, updateProject, createLyrics, getLyricsByProjectId } from '../db';
import type { InsertProcessingJob } from '../../drizzle/schema';
import { transformMusicStyle } from './wondereaService';
import { transcribeLyrics, formatLyricsText } from './whisperService';
import { renderLyricVideo } from './videoRenderer';

type JobType = 'style_transfer' | 'transcription' | 'video_render';

export interface ProcessingJobPayload {
  projectId: number;
  jobType: JobType;
}

export async function queueJob(payload: ProcessingJobPayload): Promise<number> {
  const jobData: InsertProcessingJob = {
    projectId: payload.projectId,
    jobType: payload.jobType,
    status: 'pending',
    retryCount: 0,
  };

  await createProcessingJob(jobData);
  return 1;
}

export async function processPendingJobs() {
  const pendingJobs = await getPendingJobs();

  for (const job of pendingJobs) {
    try {
      await updateProcessingJob(job.id, { status: 'processing' });

      switch (job.jobType) {
        case 'style_transfer':
          await processStyleTransfer(job.projectId);
          break;
        case 'transcription':
          await processTranscription(job.projectId);
          break;
        case 'video_render':
          await processVideoRender(job.projectId);
          break;
      }

      await updateProcessingJob(job.id, { status: 'completed' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const newRetryCount = job.retryCount + 1;
      const shouldRetry = newRetryCount < 3;

      await updateProcessingJob(job.id, {
        status: shouldRetry ? 'pending' : 'failed',
        errorMessage,
        retryCount: newRetryCount,
      });

      console.error(`Job ${job.id} failed:`, errorMessage);
    }
  }
}

async function processStyleTransfer(projectId: number) {
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  console.log(`[Style Transfer] Processing project ${projectId} with style: ${project.musicStyle}`);

  try {
    const result = await transformMusicStyle(project.originalAudioUrl, project.musicStyle);

    await updateProject(projectId, {
      transformedAudioUrl: result.transformedUrl,
    });

    console.log(`[Style Transfer] Completed for project ${projectId}`);
  } catch (error) {
    console.error(`[Style Transfer] Error:`, error);
    throw error;
  }
}

async function processTranscription(projectId: number) {
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  console.log(`[Transcription] Processing project ${projectId}`);

  try {
    const audioUrl = project.transformedAudioUrl || project.originalAudioUrl;
    const lyrics = await transcribeLyrics(audioUrl);
    const content = formatLyricsText(lyrics);

    const existingLyrics = await getLyricsByProjectId(projectId);
    if (!existingLyrics) {
      await createLyrics({
        projectId,
        content,
        lyricsJson: JSON.stringify(lyrics),
        isEdited: 0,
      });
    }

    console.log(`[Transcription] Extracted ${lyrics.length} lyric lines for project ${projectId}`);
  } catch (error) {
    console.error(`[Transcription] Error:`, error);
    throw error;
  }
}

async function processVideoRender(projectId: number) {
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  const lyrics = await getLyricsByProjectId(projectId);
  if (!lyrics) throw new Error('No lyrics found for project');

  console.log(`[Video Render] Processing project ${projectId}`);

  try {
    const lyricsData = JSON.parse(lyrics.lyricsJson);
    const audioUrl = project.transformedAudioUrl || project.originalAudioUrl;

    const result = await renderLyricVideo({
      audioUrl,
      lyrics: lyricsData,
      backgroundTheme: project.backgroundTheme,
      quality: '1080p',
    });

    await updateProject(projectId, {
      videoUrl: result.videoUrl,
      status: 'completed',
    });

    console.log(`[Video Render] Completed for project ${projectId}`);
  } catch (error) {
    console.error(`[Video Render] Error:`, error);
    throw error;
  }
}
