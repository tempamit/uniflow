import { pool } from '../../db/pool.js';

export async function enqueueVerificationEmail({ eventId, visitorId, toEmail, toName, verificationToken, eventSlug }) {
  const query = `
    INSERT INTO email_outbox (event_id, visitor_id, type, payload)
    VALUES ($1, $2, 'visitor_verification', $3::jsonb)
    RETURNING id, status, scheduled_at AS "scheduledAt"
  `;

  const payload = JSON.stringify({
    toEmail,
    toName,
    verificationToken,
    eventSlug
  });

  const { rows } = await pool.query(query, [eventId, visitorId, payload]);
  return rows[0];
}
