import { Router } from 'express';
import { createEventHandler } from '../modules/events/events.controller.js';
import { createEventValidation } from '../validators/eventValidators.js';

export const eventsRouter = Router();

eventsRouter.post('/', createEventValidation, createEventHandler);
