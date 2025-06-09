import { NextApiRequest, NextApiResponse } from 'next';
import Tokens from 'csrf';

const tokens = new Tokens();

export const generateCsrfToken = () => {
  return tokens.create(process.env.SESSION_SECRET as string);
};

export const validateCsrfToken = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  const csrfToken = req.headers['x-csrf-token'] as string;
  
  if (!csrfToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }
  
  if (!tokens.verify(process.env.SESSION_SECRET as string, csrfToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};