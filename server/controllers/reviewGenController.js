import { query } from '../db/connection.js';
import { REVIEW_CONFIG } from '../../review.config.js';
import { checkAiRateLimit } from '../middleware/rateLimiter.js';
import { streamReview, postProcessReviewText } from '../services/aiService.js';
import { generateReviewSchema } from '../validation/schemas.js';

/**
 * SSE Streaming AI Review Generator
 * POST /api/generate-review
 */
export async function handleGenerateReview(req, res) {
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';

  // 1. Rate limiting check
  const rateLimitResult = checkAiRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: rateLimitResult.error });
  }

  // 2. Validate request payload using Zod schema
  const parseResult = generateReviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input parameters' });
  }

  const { stars, options, selectedIds, seed, previousReview } = parseResult.data;
  const optionsArray = options || selectedIds || [];

  // Fetch valid options from DB with fallback to default config
  let validOptionsList = [];
  try {
    const dbOptions = await query('SELECT id, label, ai_hint FROM review_options WHERE is_visible = 1');
    if (dbOptions && dbOptions.length > 0) {
      validOptionsList = dbOptions;
    } else {
      validOptionsList = REVIEW_CONFIG.OPTIONS;
    }
  } catch {
    validOptionsList = REVIEW_CONFIG.OPTIONS;
  }

  const validOptionMap = new Map(validOptionsList.map((o) => [o.id, o]));

  for (const opt of optionsArray) {
    if (!validOptionMap.has(opt)) {
      return res.status(400).json({ error: `Unknown option ID: ${opt}` });
    }
  }

  // Map options to human labels and extra AI hints
  const optionLabels = optionsArray.map((id) => {
    const found = validOptionMap.get(id);
    if (!found) return id;
    if (found.ai_hint) {
      return `${found.label} (${found.ai_hint})`;
    }
    return found.label;
  });

  const cleanPrevReview = previousReview ? previousReview.slice(0, 400) : undefined;

  // 3. Prepare Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  const abortController = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  let rawAccumulated = '';

  try {
    await streamReview({
      stars,
      optionLabels,
      seed,
      previousReview: cleanPrevReview,
      signal: abortController.signal,
      onToken: (token) => {
        rawAccumulated += token;
        res.write(`data: ${JSON.stringify({ delta: token, text: token })}\n\n`);
      },
    });

    const processed = postProcessReviewText(rawAccumulated);

    if (!processed) {
      res.write(`data: ${JSON.stringify({ error: 'Empty output from model' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ done: true, fullText: processed })}\n\n`);
      res.write('data: [DONE]\n\n');
    }
  } catch (err) {
    if (!abortController.signal.aborted) {
      console.error('[AI Review Error]', err.message);
      res.write(`data: ${JSON.stringify({ error: 'AI generation error' })}\n\n`);
    }
  } finally {
    res.end();
  }
}
