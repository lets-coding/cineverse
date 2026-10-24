import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface MovieQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  genre?: string;
  industry?: string;
  country?: string;
  language?: string;
  year?: string;
  yearFrom?: string;
  yearTo?: string;
  minRating?: string;
  quality?: string;
  type?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'rating' | 'alpha';
  featured?: string;
}
