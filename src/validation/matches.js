import { z } from 'zod';

/**
 * Schema for validating the body of a request to create a new match.
 */
export const createMatchSchema = z.object({
  sport: z.string().min(1, { message: 'Sport cannot be empty.' }),
  homeTeam: z.string().min(1, { message: 'Home team cannot be empty.' }),
  awayTeam: z.string().min(1, { message: 'Away team cannot be empty.' }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start time" }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end time" }),
  homeScore: z.number().int().nonnegative().optional(),
  awayScore: z.number().int().nonnegative().optional(),
});

/**
 * Schema for validating the query parameters when listing matches.
 */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});
