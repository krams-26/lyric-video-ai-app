import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getUserProjects, getProjectById, createProject, updateProject, getLyricsByProjectId, createLyrics } from '../db';
import { queueJob } from '../services/jobQueue';
// Storage integration will be added later

const MUSIC_STYLES = ['Orchestra', 'Jazz', 'Rock', 'EDM', 'Lo-fi', 'Classical'] as const;
const BACKGROUND_THEMES = ['dark', 'light', 'gradient', 'abstract'] as const;
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export const projectsRouter = router({
  /**
   * List all projects for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserProjects(ctx.user.id);
  }),

  /**
   * Get a specific project by ID
   */
  getById: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error('Project not found or unauthorized');
      }
      return project;
    }),

  /**
   * Create a new project with uploaded audio
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        audioUrl: z.string().url(),
        musicStyle: z.enum(MUSIC_STYLES),
        backgroundTheme: z.enum(BACKGROUND_THEMES).default('dark'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await createProject({
        userId: ctx.user.id,
        title: input.title,
        originalAudioUrl: input.audioUrl,
        musicStyle: input.musicStyle,
        backgroundTheme: input.backgroundTheme,
        status: 'processing',
      });

      // Queue the style transfer job
      await queueJob({
        projectId: 1, // TODO: Get actual project ID from insert result
        jobType: 'style_transfer',
      });

      // Queue the transcription job
      await queueJob({
        projectId: 1,
        jobType: 'transcription',
      });

      return project;
    }),

  /**
   * Update project details
   */
  update: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().optional(),
        musicStyle: z.enum(MUSIC_STYLES).optional(),
        backgroundTheme: z.enum(BACKGROUND_THEMES).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error('Project not found or unauthorized');
      }

      const updates: Record<string, unknown> = {};
      if (input.title) updates.title = input.title;
      if (input.musicStyle) updates.musicStyle = input.musicStyle;
      if (input.backgroundTheme) updates.backgroundTheme = input.backgroundTheme;

      await updateProject(input.projectId, updates);
      return getProjectById(input.projectId);
    }),

  /**
   * Get lyrics for a project
   */
  getLyrics: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error('Project not found or unauthorized');
      }

      const lyrics = await getLyricsByProjectId(input.projectId);
      if (!lyrics) return null;

      return {
        id: lyrics.id,
        content: lyrics.content,
        lyricsJson: JSON.parse(lyrics.lyricsJson),
        isEdited: lyrics.isEdited === 1,
      };
    }),

  /**
   * Update lyrics for a project
   */
  updateLyrics: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        content: z.string(),
        lyricsJson: z.array(
          z.object({
            text: z.string(),
            startTime: z.number(),
            endTime: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error('Project not found or unauthorized');
      }

      const lyrics = await getLyricsByProjectId(input.projectId);
      if (!lyrics) {
        await createLyrics({
          projectId: input.projectId,
          content: input.content,
          lyricsJson: JSON.stringify(input.lyricsJson),
          isEdited: 1,
        });
      } else {
        // TODO: Update existing lyrics
      }

      return getLyricsByProjectId(input.projectId);
    }),

  /**
   * Queue video rendering for a project
   */
  renderVideo: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error('Project not found or unauthorized');
      }

      await queueJob({
        projectId: input.projectId,
        jobType: 'video_render',
      });

      return { success: true };
    }),

  /**
   * Delete a project
   */
  delete: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error('Project not found or unauthorized');
      }

      // TODO: Implement project deletion
      return { success: true };
    }),
});
