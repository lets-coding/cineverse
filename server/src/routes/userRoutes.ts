import { Router } from 'express';
import {
  getWatchlist,
  toggleWatchlist,
  getFavorites,
  toggleFavorite,
  getWatchHistory,
  savePlaybackProgress,
  addReview,
  reviewSchema,
  progressSchema,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(authenticateToken);

// Watchlist
router.get('/watchlist', getWatchlist);
router.post('/watchlist/:movieId', toggleWatchlist);

// Favorites
router.get('/favorites', getFavorites);
router.post('/favorites/:movieId', toggleFavorite);

// History & Progress
router.get('/history', getWatchHistory);
router.post('/history', validateBody(progressSchema), savePlaybackProgress);

// Reviews
router.post('/movies/:movieId/reviews', validateBody(reviewSchema), addReview);

export default router;
