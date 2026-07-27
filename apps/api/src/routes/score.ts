import type { FastifyInstance } from 'fastify';
import { scoreText } from '@cutai/slop-rules';

const MAX_TEXT_LENGTH = 50_000;

export function scoreRoutes(app: FastifyInstance) {
  app.post('/api/score', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 hour',
      },
    },
    schema: {
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', minLength: 1, maxLength: MAX_TEXT_LENGTH },
        },
      },
    },
  }, (request, reply) => {
    const { text } = request.body as { text: string };

    if (typeof text !== 'string' || text.length < 1) {
      return reply.status(400).send({ error: 'text must be a non-empty string' });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return reply.status(400).send({ error: `text must be at most ${MAX_TEXT_LENGTH} characters` });
    }

    const result = scoreText(text);
    return reply.status(200).send(result);
  });
}
