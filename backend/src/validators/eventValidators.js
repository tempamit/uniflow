import { body } from 'express-validator';

const smtpSecurityModes = ['none', 'starttls', 'tls'];

export const createEventValidation = [
  body('title').trim().isLength({ min: 3, max: 120 }),
  body('slug').trim().matches(/^[a-z0-9-]{3,80}$/),
  body('venue').trim().isLength({ min: 2, max: 150 }),
  body('startsAt').isISO8601(),
  body('endsAt').isISO8601(),
  body('smtp').isObject(),
  body('smtp.fromEmail').isEmail(),
  body('smtp.fromName').trim().isLength({ min: 2, max: 100 }),
  body('smtp.host').trim().isLength({ min: 2, max: 255 }),
  body('smtp.port').isInt({ min: 1, max: 65535 }),
  body('smtp.username').trim().isLength({ min: 1, max: 255 }),
  body('smtp.password').trim().isLength({ min: 1, max: 255 }),
  body('smtp.security').isIn(smtpSecurityModes)
];
