import { Router } from 'express';
import { registerVisitorHandler, verifyVisitorHandler } from '../modules/visitors/visitors.controller.js';
import { registerVisitorValidation, verifyVisitorValidation } from '../validators/visitorValidators.js';

export const visitorsRouter = Router();

visitorsRouter.post('/events/:slug/visitors/register', registerVisitorValidation, registerVisitorHandler);
visitorsRouter.get('/visitors/verify', verifyVisitorValidation, verifyVisitorHandler);
