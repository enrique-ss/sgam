import { JWTPayload } from './Auth.types';

declare global {
  namespace Express {
    interface Request {
      usuario?: JWTPayload;
    }
  }
}