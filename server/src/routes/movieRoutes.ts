import { Router } from 'express';
import {
  getMovies,
  getMovieBySlug,
  getFeaturedMovies,
  getHomeSections,
  recordMovieView,
  getAuthorizedDownload,
} from '../controllers/movieController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getMovies as any);
router.get('/featured', getFeaturedMovies);
router.get('/sections', getHomeSections);
router.get('/slug/:slug', optionalAuth, getMovieBySlug);
router.post('/:id/view', recordMovieView);
router.post('/:id/download/:downloadId', getAuthorizedDownload);

export default router;
