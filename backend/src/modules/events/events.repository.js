import { pool } from '../../db/pool.js';
import { encryptSecret } from '../../security/crypto.js';

export async function insertEvent(payload) {
  const query = `
    INSERT INTO events (
      title,
      slug,
      venue,
      starts_at,
      ends_at,
      status,
      smtp_from_email,
      smtp_from_name,
      smtp_host,
      smtp_port,
      smtp_username,
      smtp_password,
      smtp_security
    )
    VALUES ($1,$2,$3,$4,$5,'draft',$6,$7,$8,$9,$10,$11,$12)
    RETURNING id, title, slug, venue, starts_at AS "startsAt", ends_at AS "endsAt", status,
      smtp_from_email AS "smtpFromEmail", smtp_from_name AS "smtpFromName", smtp_host AS "smtpHost",
      smtp_port AS "smtpPort", smtp_username AS "smtpUsername", smtp_security AS "smtpSecurity", created_at AS "createdAt";
  `;

  const encryptedSmtpPassword = encryptSecret(payload.smtp.password);

  const values = [
    payload.title,
    payload.slug,
    payload.venue,
    payload.startsAt,
    payload.endsAt,
    payload.smtp.fromEmail,
    payload.smtp.fromName,
    payload.smtp.host,
    payload.smtp.port,
    payload.smtp.username,
    encryptedSmtpPassword,
    payload.smtp.security
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function getEventBySlug(slug) {
  const query = `
    SELECT
      id,
      title,
      slug,
      venue,
      starts_at AS "startsAt",
      ends_at AS "endsAt",
      status,
      smtp_from_email AS "smtpFromEmail",
      smtp_from_name AS "smtpFromName",
      smtp_host AS "smtpHost",
      smtp_port AS "smtpPort",
      smtp_username AS "smtpUsername",
      smtp_security AS "smtpSecurity",
      created_at AS "createdAt"
    FROM events
    WHERE slug = $1
  `;
  const { rows } = await pool.query(query, [slug]);
  return rows[0] ?? null;
}

export async function getEventSmtpConfigByEventId(eventId) {
  const query = `
    SELECT
      id,
      slug,
      smtp_from_email AS "fromEmail",
      smtp_from_name AS "fromName",
      smtp_host AS host,
      smtp_port AS port,
      smtp_username AS username,
      smtp_password AS "passwordEncrypted",
      smtp_security AS security
    FROM events
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [eventId]);
  return rows[0] ?? null;
}
