import { Request, Response } from 'express';
import { prisma } from '../services/db.js';
import { AuthenticatedRequest, MovieQueryParams } from '../types/index.js';

export async function getMovies(req: Request<unknown, unknown, unknown, MovieQueryParams>, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const {
      search,
      genre,
      industry,
      country,
      language,
      year,
      yearFrom,
      yearTo,
      minRating,
      quality,
      type,
      sort = 'newest',
      featured,
    } = req.query;

    // Build Prisma where filter
    const where: any = {
      isPublished: true,
    };

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (type) {
      where.contentType = type.toUpperCase();
    }

    if (year) {
      where.releaseYear = parseInt(year, 10);
    } else if (yearFrom || yearTo) {
      where.releaseYear = {};
      if (yearFrom) where.releaseYear.gte = parseInt(yearFrom, 10);
      if (yearTo) where.releaseYear.lte = parseInt(yearTo, 10);
    }

    if (minRating) {
      where.externalRating = {
        gte: parseFloat(minRating),
      };
    }

    // Genre filter
    if (genre) {
      where.genres = {
        some: {
          genre: {
            slug: genre.toLowerCase(),
          },
        },
      };
    }

    // Industry filter
    if (industry) {
      where.industries = {
        some: {
          industry: {
            slug: industry.toLowerCase(),
          },
        },
      };
    }

    // Country filter
    if (country) {
      where.countries = {
        some: {
          country: {
            code: country.toUpperCase(),
          },
        },
      };
    }

    // Language filter
    if (language) {
      where.languages = {
        some: {
          language: {
            code: language.toLowerCase(),
          },
        },
      };
    }

    // Quality filter
    if (quality) {
      where.videoSources = {
        some: {
          qualityLabel: {
            contains: quality,
          },
        },
      };
    }

    // Full-text search across title, keywords, synopsis, director, cast
    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { title: { contains: term } },
        { originalTitle: { contains: term } },
        { searchKeywords: { contains: term } },
        { description: { contains: term } },
        {
          credits: {
            some: {
              person: {
                name: { contains: term },
              },
            },
          },
        },
      ];
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { releaseYear: 'asc' };
    } else if (sort === 'popular') {
      orderBy = [{ viewsCount: 'desc' }, { externalRating: 'desc' }];
    } else if (sort === 'rating') {
      orderBy = { externalRating: 'desc' };
    } else if (sort === 'alpha') {
      orderBy = { title: 'asc' };
    } else {
      orderBy = [{ releaseYear: 'desc' }, { createdAt: 'desc' }];
    }

    const [total, movies] = await Promise.all([
      prisma.movie.count({ where }),
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          originalTitle: true,
          slug: true,
          description: true,
          releaseYear: true,
          contentType: true,
          runtime: true,
          ageRating: true,
          externalRating: true,
          ratingSource: true,
          posterUrl: true,
          backdropUrl: true,
          isFeatured: true,
          downloadEnabled: true,
          viewsCount: true,
          genres: {
            select: {
              genre: {
                select: { name: true, slug: true },
              },
            },
          },
          industries: {
            select: {
              industry: {
                select: { name: true, slug: true },
              },
            },
          },
          videoSources: {
            select: {
              qualityLabel: true,
              format: true,
            },
          },
        },
      }),
    ]);

    // Format output
    const formatted = movies.map((m) => ({
      ...m,
      genres: m.genres.map((g) => g.genre),
      industries: m.industries.map((i) => i.industry),
      availableQualities: m.videoSources.map((v) => v.qualityLabel),
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getMovies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve movies' });
  }
}

export async function getMovieBySlug(req: AuthenticatedRequest, res: Response) {
  try {
    const { slug } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        countries: { include: { country: true } },
        industries: { include: { industry: true } },
        languages: { include: { language: true } },
        credits: {
          include: { person: true },
          orderBy: { order: 'asc' },
        },
        videoSources: true,
        subtitleTracks: true,
        downloadSources: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!movie || (!movie.isPublished && req.user?.role !== 'ADMIN')) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Check user-specific watchlist, favorite, and progress if authenticated
    let isInWatchlist = false;
    let isFavorite = false;
    let userProgress = 0;

    if (req.user) {
      const [wl, fav, history] = await Promise.all([
        prisma.watchlist.findUnique({
          where: { userId_movieId: { userId: req.user.id, movieId: movie.id } },
        }),
        prisma.favorite.findUnique({
          where: { userId_movieId: { userId: req.user.id, movieId: movie.id } },
        }),
        prisma.watchHistory.findUnique({
          where: { userId_movieId: { userId: req.user.id, movieId: movie.id } },
        }),
      ]);

      isInWatchlist = !!wl;
      isFavorite = !!fav;
      userProgress = history?.progressSeconds || 0;
    }

    // Recommendations: fetch related movies sharing at least one genre
    const genreIds = movie.genres.map((g) => g.genreId);
    const relatedMovies = await prisma.movie.findMany({
      where: {
        id: { not: movie.id },
        isPublished: true,
        genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        releaseYear: true,
        posterUrl: true,
        externalRating: true,
        contentType: true,
        genres: { select: { genre: { select: { name: true, slug: true } } } },
      },
    });

    const formattedMovie = {
      ...movie,
      genres: movie.genres.map((g) => g.genre),
      countries: movie.countries.map((c) => c.country),
      industries: movie.industries.map((i) => i.industry),
      languages: movie.languages.map((l) => ({
        ...l.language,
        isAudio: l.isAudio,
        isSubtitle: l.isSubtitle,
      })),
      credits: movie.credits.map((c) => ({
        id: c.id,
        role: c.role,
        characterName: c.characterName,
        person: c.person,
      })),
      isInWatchlist,
      isFavorite,
      userProgress,
      recommendations: relatedMovies.map((r) => ({
        ...r,
        genres: r.genres.map((g) => g.genre),
      })),
    };

    return res.status(200).json({
      success: true,
      data: formattedMovie,
    });
  } catch (error) {
    console.error('getMovieBySlug error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve movie details' });
  }
}

export async function getFeaturedMovies(req: Request, res: Response) {
  try {
    const movies = await prisma.movie.findMany({
      where: { isPublished: true, isFeatured: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        genres: { select: { genre: true } },
        industries: { select: { industry: true } },
      },
    });

    const formatted = movies.map((m) => ({
      ...m,
      genres: m.genres.map((g) => g.genre),
      industries: m.industries.map((i) => i.industry),
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getFeaturedMovies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve featured movies' });
  }
}

export async function getHomeSections(req: Request, res: Response) {
  try {
    const [hero, trending, popular, topRated, recentlyAdded] = await Promise.all([
      // Hero featured movie
      prisma.movie.findFirst({
        where: { isPublished: true, isFeatured: true },
        include: {
          genres: { select: { genre: true } },
          industries: { select: { industry: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Trending (high views & high rating)
      prisma.movie.findMany({
        where: { isPublished: true },
        take: 8,
        orderBy: [{ viewsCount: 'desc' }, { releaseYear: 'desc' }],
        include: {
          genres: { select: { genre: true } },
        },
      }),
      // Popular
      prisma.movie.findMany({
        where: { isPublished: true },
        take: 8,
        orderBy: { viewsCount: 'desc' },
        include: {
          genres: { select: { genre: true } },
        },
      }),
      // Top Rated
      prisma.movie.findMany({
        where: { isPublished: true, externalRating: { not: null } },
        take: 8,
        orderBy: { externalRating: 'desc' },
        include: {
          genres: { select: { genre: true } },
        },
      }),
      // Recently Added
      prisma.movie.findMany({
        where: { isPublished: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          genres: { select: { genre: true } },
        },
      }),
    ]);

    const formatRow = (list: any[]) =>
      list.map((m) => ({
        ...m,
        genres: m.genres.map((g: any) => g.genre),
      }));

    return res.status(200).json({
      success: true,
      data: {
        hero: hero
          ? {
              ...hero,
              genres: hero.genres.map((g) => g.genre),
              industries: hero.industries.map((i) => i.industry),
            }
          : null,
        trending: formatRow(trending),
        popular: formatRow(popular),
        topRated: formatRow(topRated),
        recentlyAdded: formatRow(recentlyAdded),
      },
    });
  } catch (error) {
    console.error('getHomeSections error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve home sections' });
  }
}

export async function recordMovieView(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
      select: { id: true, viewsCount: true },
    });

    return res.status(200).json({ success: true, viewsCount: movie.viewsCount });
  } catch (error) {
    console.error('recordMovieView error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record view' });
  }
}

export async function getAuthorizedDownload(req: Request, res: Response) {
  try {
    const { id, downloadId } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { id: true, downloadEnabled: true, title: true },
    });

    if (!movie || !movie.downloadEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Downloads are not authorized or disabled for this title.',
      });
    }

    const downloadSource = await prisma.downloadSource.findUnique({
      where: { id: downloadId },
    });

    if (!downloadSource || downloadSource.movieId !== movie.id) {
      return res.status(404).json({ success: false, message: 'Download source not found' });
    }

    // Increment downloads count on movie and source
    await Promise.all([
      prisma.movie.update({
        where: { id: movie.id },
        data: { downloadsCount: { increment: 1 } },
      }),
      prisma.downloadSource.update({
        where: { id: downloadSource.id },
        data: { downloadsCount: { increment: 1 } },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        title: movie.title,
        qualityLabel: downloadSource.qualityLabel,
        resolution: downloadSource.resolution,
        fileSize: downloadSource.fileSize,
        format: downloadSource.format,
        downloadUrl: downloadSource.downloadUrl,
      },
    });
  } catch (error) {
    console.error('getAuthorizedDownload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate download link' });
  }
}
