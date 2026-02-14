import { Router } from 'express';
import { eventsRouter } from './events.routes.js';
import { visitorsRouter } from './visitors.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/events', eventsRouter);
apiRouter.use('/', visitorsRouter);
