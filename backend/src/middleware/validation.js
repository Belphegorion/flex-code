import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation error',
      errors: errors.array() 
    });
  }
  next();
};

// Express v5 compatible query parser
export const parseQuery = (req, res, next) => {
  // Create a mutable copy of query if needed
  if (req.query && typeof req.query === 'object') {
    req.parsedQuery = { ...req.query };
  }
  next();
};