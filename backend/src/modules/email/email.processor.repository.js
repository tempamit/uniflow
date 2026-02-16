import { pool } from '../../db/pool.js';

export async function claimQueuedEmailJob() {
  const query = `
    WITH candidate AS (
      SELECT id
      FROM email_outbox
      WHERE status = 'queued' AND scheduled_at <= NOW()
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    UPDATE email_outbox e
    SET status = 'processing', attempts = attempts + 1
    FROM candidate
    WHERE e.id = candidate.id
    RETURNING e.id, e.event_id AS "eventId", e.type, e.payload, e.attempts;
  `;

  const { rows } = await pool.query(query);
  return rows[0] ?? null;
}

export async function markEmailJobSent(jobId) {
  await pool.query(
    `UPDATE email_outbox SET status = 'sent', sent_at = NOW(), last_error = NULL WHERE id = $1`,
    [jobId]
  );
}

export async function markEmailJobFailed(jobId, errorMessage) {
  const query = `
    UPDATE email_outbox
    SET
      status = CASE WHEN attempts >= 5 THEN 'failed' ELSE 'queued' END,
      last_error = $2,
      scheduled_at = CASE WHEN attempts >= 5 THEN scheduled_at ELSE NOW() + INTERVAL '2 minutes' END
    WHERE id = $1
  `;

  await pool.query(query, [jobId, errorMessage]);
}
