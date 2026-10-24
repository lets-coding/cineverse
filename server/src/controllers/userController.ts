import { Response } from 'express';
import { prisma } from '../services/db.js';
import { AuthenticatedRequest } from '../types/index.js';
import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(10),
  comment: z.string().min(3).max(1000),
});

export const progressSchema = z.object({
  movieId: z.string().uuid(),
  progressSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(0),
});

// Watchlist
export async function getWatchlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const items = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
            releaseYear: true,
            externalRating: true,
            contentType: true,
            runtime: true,
            genres: { select: { genre: { select: { name: true, slug: true } } } },
          },
        },
      },
    });

    const formatted = items.map((item) => ({
      ...item.movie,
      addedAt: item.createdAt,
      genres: item.movie.genres.map((g) => g.genre),
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getWatchlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve watchlist' });
  }
}

export async function toggleWatchlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { movieId } = req.params;

    const existing = await prisma.watchlist.findUnique({
      where: { userId_movieId: { userId: req.user.id, movieId } },
    });

    if (existing) {
      await prisma.watchlist.delete({
        where: { userId_movieId: { userId: req.user.id, movieId } },
      });
      return res.status(200).json({ success: true, isInWatchlist: false, message: 'Removed from watchlist' });
    } else {
      await prisma.watchlist.create({
        data: { userId: req.user.id, movieId },
      });
      return res.status(200).json({ success: true, isInWatchlist: true, message: 'Added to watchlist' });
    }
  } catch (error) {
    console.error('toggleWatchlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update watchlist' });
  }
}

// Favorites
export async function getFavorites(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const items = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
            releaseYear: true,
            externalRating: true,
            contentType: true,
            runtime: true,
            genres: { select: { genre: { select: { name: true, slug: true } } } },
          },
        },
      },
    });

    const formatted = items.map((item) => ({
      ...item.movie,
      addedAt: item.createdAt,
      genres: item.movie.genres.map((g) => g.genre),
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getFavorites error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve favorites' });
  }
}

export async function toggleFavorite(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { movieId } = req.params;

    const existing = await prisma.favorite.findUnique({
      where: { userId_movieId: { userId: req.user.id, movieId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_movieId: { userId: req.user.id, movieId } },
      });
      return res.status(200).json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({
        data: { userId: req.user.id, movieId },
      });
      return res.status(200).json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update favorites' });
  }
}

// Watch History & Playback Progress
export async function getWatchHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const history = await prisma.watchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { lastWatchedAt: 'desc' },
      take: 20,
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
            backdropUrl: true,
            runtime: true,
            genres: { select: { genre: { select: { name: true } } } },
          },
        },
      },
    });

    const formatted = history.map((h) => ({
      id: h.id,
      progressSeconds: h.progressSeconds,
      durationSeconds: h.durationSeconds,
      percentage: h.durationSeconds > 0 ? Math.round((h.progressSeconds / h.durationSeconds) * 100) : 0,
      completed: h.completed,
      lastWatchedAt: h.lastWatchedAt,
      movie: {
        ...h.movie,
        genres: h.movie.genres.map((g) => g.genre.name),
      },
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getWatchHistory error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve watch history' });
  }
}

export async function savePlaybackProgress(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { movieId, progressSeconds, durationSeconds } = req.body;

    const completed = durationSeconds > 0 && progressSeconds / durationSeconds >= 0.9;

    const saved = await prisma.watchHistory.upsert({
      where: {
        userId_movieId: {
          userId: req.user.id,
          movieId,
        },
      },
      update: {
        progressSeconds,
        durationSeconds,
        completed,
        lastWatchedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        movieId,
        progressSeconds,
        durationSeconds,
        completed,
      },
    });

    return res.status(200).json({ success: true, data: saved });
  } catch (error) {
    console.error('savePlaybackProgress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save progress' });
  }
}

// Reviews
export async function addReview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { movieId } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.upsert({
      where: {
        userId_movieId: {
          userId: req.user.id,
          movieId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: req.user.id,
        movieId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.status(200).json({ success: true, data: review, message: 'Review submitted' });
  } catch (error) {
    console.error('addReview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
}
