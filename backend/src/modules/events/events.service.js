import { insertEvent, getEventBySlug } from './events.repository.js';

export async function createEvent(payload) {
  const existing = await getEventBySlug(payload.slug);
  if (existing) {
    const error = new Error('Event slug already exists');
    error.statusCode = 409;
    throw error;
  }

  return insertEvent(payload);
}
