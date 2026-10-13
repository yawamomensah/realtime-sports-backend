import { Router } from 'express';
import { db } from '#/db/db.js';
import { commentary } from '#/db/schema.js';
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
  matchIdParamSchema,
} from '#/validation/commentary.js';
import { desc, eq } from 'drizzle-orm';

export const commentaryRouter = Router({ mergeParams: true });
const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
  const paramsParsed = matchIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid match ID.', details: paramsParsed.error.issues });
  }

  const queryParsed = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({ error: 'Invalid query parameters.', details: queryParsed.error.issues });
  }

  const { id: matchId } = paramsParsed.data;
  const limit = Math.min(queryParsed.data.limit ?? 100, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    res.status(200).json({ data });
  } catch (e) {
    console.error('Failed to list commentary:', e);
    res.status(500).json({ error: 'Failed to list commentary.' });
  }
});

commentaryRouter.post('/', async (req, res) => {
  const paramsParsed = matchIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid match ID.', details: paramsParsed.error.issues });
  }

  const bodyParsed = createCommentarySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: 'Invalid payload.', details: bodyParsed.error.issues });
  }

  const { id: matchId } = paramsParsed.data;

  try {
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        ...bodyParsed.data,
        matchId,
      })
      .returning();

      if (res.app.locals.broadcastCommentary)
        res.app.locals.broadcastCommentary(matchId, newCommentary);

    res.status(201).json({ data: newCommentary });
  } catch (e) {
    console.error('Failed to create commentary:', e);
    res.status(500).json({ error: 'Failed to create commentary.' });
  }
});
