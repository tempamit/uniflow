import { enqueueVerificationEmail } from '../email/email.repository.js';
import { getEventBySlug } from '../events/events.repository.js';
import {
  getVisitorByEventAndEmail,
  insertVisitorRegistration,
  verifyVisitorByTokenHash
} from './visitors.repository.js';
import { generateVerificationToken, getVerificationExpiry, hashToken } from '../../utils/tokens.js';

export async function registerVisitor(eventSlug, payload) {
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const existing = await getVisitorByEventAndEmail(event.id, payload.email);
  if (existing) {
    const error = new Error('Visitor already registered for this event');
    error.statusCode = 409;
    throw error;
  }

  const verificationToken = generateVerificationToken();

  const visitor = await insertVisitorRegistration({
    eventId: event.id,
    email: payload.email,
    fullName: payload.fullName,
    phone: payload.phone,
    formData: payload.formData,
    verificationTokenHash: hashToken(verificationToken),
    verificationExpiresAt: getVerificationExpiry(24)
  });

  const outboxJob = await enqueueVerificationEmail({
    eventId: event.id,
    visitorId: visitor.id,
    toEmail: payload.email,
    toName: payload.fullName,
    verificationToken,
    eventSlug
  });

  return {
    visitor,
    outboxJob
  };
}

export async function verifyVisitor(token) {
  const verifiedVisitor = await verifyVisitorByTokenHash(hashToken(token));

  if (!verifiedVisitor) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  return verifiedVisitor;
}
