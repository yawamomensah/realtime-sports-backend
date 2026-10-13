import { z } from 'zod';

/**
 * Schema for validating the match ID from URL parameters.
 */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Schema for validating the query parameters when listing commentary.
 * - limit: Optional number for pagination, positive integer, max 100.
 */
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Schema for validating the body of a request to create a new commentary.
 * Based on the `commentary` table schema.
 */
export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().nonnegative().optional(),
  sequence: z.coerce.number().int().optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
});
