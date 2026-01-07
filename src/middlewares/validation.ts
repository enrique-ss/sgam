import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../exceptions';

/**
 * Middleware genérico de validação usando DTOs
 */
export function validate(DtoClass: any) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = new DtoClass(req.body);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        next(new ValidationError((error as Error).message));
      }
    }
  };
}