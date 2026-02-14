import { body, param, query } from 'express-validator';

export const registerVisitorValidation = [
  param('slug').trim().matches(/^[a-z0-9-]{3,80}$/),
  body('email').isEmail().normalizeEmail(),
  body('fullName').trim().isLength({ min: 2, max: 150 }),
  body('phone').optional().trim().isLength({ min: 6, max: 32 }),
  body('formData').optional().isObject()
];

export const verifyVisitorValidation = [
  query('token').trim().isLength({ min: 32 })
];
