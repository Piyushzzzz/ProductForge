import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { AuthUserPayload } from '../types/index.js';

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any
  });
};

export const verifyToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as AuthUserPayload;
};
