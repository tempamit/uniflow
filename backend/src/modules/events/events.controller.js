import { validationResult } from 'express-validator';
import { createEvent } from './events.service.js';

export async function createEventHandler(req, res, next) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const event = await createEvent(req.body);
    return res.status(201).json({ data: event });
  } catch (error) {
    next(error);
  }
}
