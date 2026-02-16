import { pool } from '../../db/pool.js';

export async function insertVisitorRegistration(payload) {
  const query = `
    INSERT INTO visitors (
      event_id,
      email,
      full_name,
      phone,
      form_data,
      verification_token_hash,
      verification_expires_at
    )
    VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)
    RETURNING id, event_id AS "eventId", email, full_name AS "fullName", registration_status AS "registrationStatus", created_at AS "createdAt";
  `;

  const values = [
    payload.eventId,
    payload.email,
    payload.fullName,
    payload.phone,
    JSON.stringify(payload.formData ?? {}),
    payload.verificationTokenHash,
    payload.verificationExpiresAt
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function getVisitorByEventAndEmail(eventId, email) {
  const query = `
    SELECT id, event_id AS "eventId", email, registration_status AS "registrationStatus"
    FROM visitors
    WHERE event_id = $1 AND email = $2
  `;
  const { rows } = await pool.query(query, [eventId, email]);
  return rows[0] ?? null;
}

export async function verifyVisitorByTokenHash(tokenHash) {
  const query = `
    UPDATE visitors
    SET
      registration_status = 'verified',
      verified_at = NOW(),
      qr_badge_code = encode(gen_random_bytes(16), 'hex'),
      updated_at = NOW()
    WHERE
      verification_token_hash = $1
      AND registration_status = 'pending_verification'
      AND verification_expires_at > NOW()
    RETURNING
      id,
      event_id AS "eventId",
      email,
      full_name AS "fullName",
      registration_status AS "registrationStatus",
      verified_at AS "verifiedAt",
      qr_badge_code AS "qrBadgeCode";
  `;

  const { rows } = await pool.query(query, [tokenHash]);
  return rows[0] ?? null;
}
