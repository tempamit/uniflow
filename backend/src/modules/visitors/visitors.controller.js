import { validationResult } from 'express-validator';
import { registerVisitor, verifyVisitor } from './visitors.service.js';

export async function registerVisitorHandler(req, res, next) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const response = await registerVisitor(req.params.slug, req.body);
    return res.status(201).json({ data: response });
  } catch (error) {
    next(error);
  }
}

export async function verifyVisitorHandler(req, res, next) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json({ errors: result.array() });
    }

    const response = await verifyVisitor(req.query.token);
    return res.status(200).json({ data: response });
  } catch (error) {
    next(error);
  }
}
