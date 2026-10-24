import { Response } from 'express';
import { prisma } from '../services/db.js';
import { AuthenticatedRequest } from '../types/index.js';
import { z } from 'zod';

export const movieFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  originalTitle: z.string().optional().nullable(),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  synopsis: z.string().min(1, 'Synopsis is required'),
  releaseYear: z.number().int().min(1888).max(2100),
  releaseDate: z.string().optional().nullable(),
  contentType: z.enum(['MOVIE', 'SERIES', 'SHORT_FILM', 'DOCUMENTARY']).default('MOVIE'),
  runtime: z.number().int().min(1),
  ageRating: z.string().default('PG-13'),
  externalRating: z.number().min(0).max(10).optional().nullable(),
  ratingSource: z.string().optional().nullable().default('IMDb'),
  posterUrl: z.string().url('Poster URL must be a valid URL'),
  backdropUrl: z.string().url('Backdrop URL must be a valid URL'),
  trailerUrl: z.string().optional().nullable(),
  searchKeywords: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  downloadEnabled: z.boolean().default(true),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  genreIds: z.array(z.string()).default([]),
  industryIds: z.array(z.string()).default([]),
  countryIds: z.array(z.string()).default([]),
  languageIds: z.array(z.string()).default([]),
  director: z.string().optional().nullable(),
  cast: z
    .array(
      z.object({
        name: z.string(),
        characterName: z.string().optional().nullable(),
      })
    )
    .default([]),
  videoSources: z
    .array(
      z.object({
        format: z.string().default('hls'),
        streamUrl: z.string().url(),
        qualityLabel: z.string().default('Auto'),
        isPrimary: z.boolean().default(false),
        duration: z.number().int().optional().nullable(),
      })
    )
    .default([]),
  subtitleTracks: z
    .array(
      z.object({
        language: z.string(),
        label: z.string(),
        vttUrl: z.string().url(),
        isDefault: z.boolean().default(false),
      })
    )
    .default([]),
  downloadSources: z
    .array(
      z.object({
        qualityLabel: z.string(),
        resolution: z.string(),
        fileSize: z.string(),
        format: z.string().default('mp4'),
        downloadUrl: z.string().url(),
        accessType: z.string().default('PUBLIC'),
      })
    )
    .default([]),
});

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalMovies,
      publishedMovies,
      draftMovies,
      totalGenres,
      totalIndustries,
      totalCountries,
      totalUsers,
      totalViews,
      totalDownloads,
      recentMovies,
      recentActivity,
    ] = await Promise.all([
      prisma.movie.count(),
      prisma.movie.count({ where: { isPublished: true } }),
      prisma.movie.count({ where: { isPublished: false } }),
      prisma.genre.count(),
      prisma.industry.count(),
      prisma.country.count(),
      prisma.user.count(),
      prisma.movie.aggregate({ _sum: { viewsCount: true } }),
      prisma.movie.aggregate({ _sum: { downloadsCount: true } }),
      prisma.movie.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          releaseYear: true,
          isPublished: true,
          isFeatured: true,
          createdAt: true,
          posterUrl: true,
        },
      }),
      prisma.adminActivityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalMovies,
        publishedMovies,
        draftMovies,
        totalCategories: totalGenres + totalIndustries + totalCountries,
        totalUsers,
        totalViews: totalViews._sum.viewsCount || 0,
        totalDownloads: totalDownloads._sum.downloadsCount || 0,
        recentMovies,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats' });
  }
}

export async function getAdminMovies(req: AuthenticatedRequest, res: Response) {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '15', 10)));
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';

    const where: any = {};
    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { slug: { contains: search.trim() } },
      ];
    }
    if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'draft') {
      where.isPublished = false;
    }

    const [total, movies] = await Promise.all([
      prisma.movie.count({ where }),
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          genres: { select: { genre: { select: { name: true } } } },
          industries: { select: { industry: { select: { name: true } } } },
          _count: {
            select: {
              videoSources: true,
              downloadSources: true,
              subtitleTracks: true,
            },
          },
        },
      }),
    ]);

    const formatted = movies.map((m) => ({
      ...m,
      genres: m.genres.map((g) => g.genre.name),
      industries: m.industries.map((i) => i.industry.name),
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
    console.error('getAdminMovies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin movies' });
  }
}

export async function createMovie(req: AuthenticatedRequest, res: Response) {
  try {
    const data = req.body;
    const adminId = req.user!.id;

    // Check slug uniqueness
    const existing = await prisma.movie.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A movie with this slug already exists' });
    }

    const movie = await prisma.movie.create({
      data: {
        title: data.title,
        originalTitle: data.originalTitle,
        slug: data.slug,
        description: data.description,
        synopsis: data.synopsis,
        releaseYear: data.releaseYear,
        releaseDate: data.releaseDate,
        contentType: data.contentType,
        runtime: data.runtime,
        ageRating: data.ageRating,
        externalRating: data.externalRating,
        ratingSource: data.ratingSource,
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl,
        trailerUrl: data.trailerUrl,
        searchKeywords: data.searchKeywords,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        downloadEnabled: data.downloadEnabled,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });

    // Connect Genres
    if (data.genreIds?.length) {
      for (const gId of data.genreIds) {
        await prisma.movieGenre.create({ data: { movieId: movie.id, genreId: gId } });
      }
    }

    // Connect Industries
    if (data.industryIds?.length) {
      for (const indId of data.industryIds) {
        await prisma.movieIndustry.create({ data: { movieId: movie.id, industryId: indId } });
      }
    }

    // Connect Countries
    if (data.countryIds?.length) {
      for (const cId of data.countryIds) {
        await prisma.movieCountry.create({ data: { movieId: movie.id, countryId: cId } });
      }
    }

    // Connect Languages
    if (data.languageIds?.length) {
      for (const lId of data.languageIds) {
        await prisma.movieLanguage.create({
          data: { movieId: movie.id, languageId: lId, isAudio: true, isSubtitle: false },
        });
      }
    }

    // Director
    if (data.director) {
      const directorPerson = await prisma.person.create({
        data: { name: data.director, role: 'DIRECTOR' },
      });
      await prisma.movieCredit.create({
        data: { movieId: movie.id, personId: directorPerson.id, role: 'DIRECTOR', order: 0 },
      });
    }

    // Cast
    if (data.cast?.length) {
      for (let i = 0; i < data.cast.length; i++) {
        const actor = await prisma.person.create({
          data: { name: data.cast[i].name, role: 'ACTOR' },
        });
        await prisma.movieCredit.create({
          data: {
            movieId: movie.id,
            personId: actor.id,
            role: 'ACTOR',
            characterName: data.cast[i].characterName,
            order: i + 1,
          },
        });
      }
    }

    // Video sources
    if (data.videoSources?.length) {
      for (const vs of data.videoSources) {
        await prisma.videoSource.create({
          data: {
            movieId: movie.id,
            format: vs.format,
            streamUrl: vs.streamUrl,
            qualityLabel: vs.qualityLabel,
            isPrimary: vs.isPrimary,
            duration: vs.duration,
          },
        });
      }
    }

    // Subtitle tracks
    if (data.subtitleTracks?.length) {
      for (const st of data.subtitleTracks) {
        await prisma.subtitleTrack.create({
          data: {
            movieId: movie.id,
            language: st.language,
            label: st.label,
            vttUrl: st.vttUrl,
            isDefault: st.isDefault,
          },
        });
      }
    }

    // Download sources
    if (data.downloadSources?.length) {
      for (const ds of data.downloadSources) {
        await prisma.downloadSource.create({
          data: {
            movieId: movie.id,
            qualityLabel: ds.qualityLabel,
            resolution: ds.resolution,
            fileSize: ds.fileSize,
            format: ds.format,
            downloadUrl: ds.downloadUrl,
            accessType: ds.accessType,
          },
        });
      }
    }

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action: 'CREATE_MOVIE',
        entityType: 'Movie',
        entityId: movie.id,
        details: `Created movie "${movie.title}" (${movie.releaseYear})`,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    console.error('createMovie error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create movie' });
  }
}

export async function updateMovie(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const adminId = req.user!.id;

    const existing = await prisma.movie.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Update movie core fields
    const updated = await prisma.movie.update({
      where: { id },
      data: {
        title: data.title,
        originalTitle: data.originalTitle,
        slug: data.slug,
        description: data.description,
        synopsis: data.synopsis,
        releaseYear: data.releaseYear,
        releaseDate: data.releaseDate,
        contentType: data.contentType,
        runtime: data.runtime,
        ageRating: data.ageRating,
        externalRating: data.externalRating,
        ratingSource: data.ratingSource,
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl,
        trailerUrl: data.trailerUrl,
        searchKeywords: data.searchKeywords,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        downloadEnabled: data.downloadEnabled,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });

    // Replace relationships if provided
    if (data.genreIds) {
      await prisma.movieGenre.deleteMany({ where: { movieId: id } });
      for (const gId of data.genreIds) {
        await prisma.movieGenre.create({ data: { movieId: id, genreId: gId } });
      }
    }

    if (data.industryIds) {
      await prisma.movieIndustry.deleteMany({ where: { movieId: id } });
      for (const indId of data.industryIds) {
        await prisma.movieIndustry.create({ data: { movieId: id, industryId: indId } });
      }
    }

    if (data.countryIds) {
      await prisma.movieCountry.deleteMany({ where: { movieId: id } });
      for (const cId of data.countryIds) {
        await prisma.movieCountry.create({ data: { movieId: id, countryId: cId } });
      }
    }

    if (data.videoSources) {
      await prisma.videoSource.deleteMany({ where: { movieId: id } });
      for (const vs of data.videoSources) {
        await prisma.videoSource.create({
          data: {
            movieId: id,
            format: vs.format,
            streamUrl: vs.streamUrl,
            qualityLabel: vs.qualityLabel,
            isPrimary: vs.isPrimary,
            duration: vs.duration,
          },
        });
      }
    }

    if (data.subtitleTracks) {
      await prisma.subtitleTrack.deleteMany({ where: { movieId: id } });
      for (const st of data.subtitleTracks) {
        await prisma.subtitleTrack.create({
          data: {
            movieId: id,
            language: st.language,
            label: st.label,
            vttUrl: st.vttUrl,
            isDefault: st.isDefault,
          },
        });
      }
    }

    if (data.downloadSources) {
      await prisma.downloadSource.deleteMany({ where: { movieId: id } });
      for (const ds of data.downloadSources) {
        await prisma.downloadSource.create({
          data: {
            movieId: id,
            qualityLabel: ds.qualityLabel,
            resolution: ds.resolution,
            fileSize: ds.fileSize,
            format: ds.format,
            downloadUrl: ds.downloadUrl,
            accessType: ds.accessType,
          },
        });
      }
    }

    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action: 'UPDATE_MOVIE',
        entityType: 'Movie',
        entityId: id,
        details: `Updated movie "${updated.title}"`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('updateMovie error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update movie' });
  }
}

export async function deleteMovie(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await prisma.movie.delete({ where: { id } });

    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action: 'DELETE_MOVIE',
        entityType: 'Movie',
        entityId: id,
        details: `Deleted movie "${movie.title}"`,
      },
    });

    return res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('deleteMovie error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete movie' });
  }
}

export async function togglePublish(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const updated = await prisma.movie.update({
      where: { id },
      data: { isPublished: !movie.isPublished },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action: updated.isPublished ? 'PUBLISH_MOVIE' : 'UNPUBLISH_MOVIE',
        entityType: 'Movie',
        entityId: id,
        details: `${updated.isPublished ? 'Published' : 'Unpublished'} movie "${updated.title}"`,
      },
    });

    return res.status(200).json({
      success: true,
      data: { id: updated.id, isPublished: updated.isPublished },
      message: `Movie is now ${updated.isPublished ? 'published' : 'draft'}`,
    });
  } catch (error) {
    console.error('togglePublish error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle status' });
  }
}

export async function toggleFeatured(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    const updated = await prisma.movie.update({
      where: { id },
      data: { isFeatured: !movie.isFeatured },
    });

    return res.status(200).json({
      success: true,
      data: { id: updated.id, isFeatured: updated.isFeatured },
      message: `Movie featured status updated`,
    });
  } catch (error) {
    console.error('toggleFeatured error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle featured status' });
  }
}

export async function bulkActions(req: AuthenticatedRequest, res: Response) {
  try {
    const { action, movieIds } = req.body;
    const adminId = req.user!.id;

    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No movies selected' });
    }

    if (action === 'publish') {
      await prisma.movie.updateMany({
        where: { id: { in: movieIds } },
        data: { isPublished: true },
      });
    } else if (action === 'unpublish') {
      await prisma.movie.updateMany({
        where: { id: { in: movieIds } },
        data: { isPublished: false },
      });
    } else if (action === 'delete') {
      await prisma.movie.deleteMany({
        where: { id: { in: movieIds } },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action: `BULK_${action.toUpperCase()}`,
        entityType: 'Movie',
        details: `Bulk ${action} on ${movieIds.length} movies`,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully on ${movieIds.length} items`,
    });
  } catch (error) {
    console.error('bulkActions error:', error);
    return res.status(500).json({ success: false, message: 'Bulk action failed' });
  }
}

export async function exportMovies(req: AuthenticatedRequest, res: Response) {
  try {
    const format = (req.query.format as string) || 'json';

    const movies = await prisma.movie.findMany({
      include: {
        genres: { select: { genre: { select: { name: true } } } },
        industries: { select: { industry: { select: { name: true } } } },
        countries: { select: { country: { select: { name: true } } } },
      },
    });

    const exportData = movies.map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      releaseYear: m.releaseYear,
      contentType: m.contentType,
      runtime: m.runtime,
      externalRating: m.externalRating,
      genres: m.genres.map((g) => g.genre.name).join(', '),
      industries: m.industries.map((i) => i.industry.name).join(', '),
      countries: m.countries.map((c) => c.country.name).join(', '),
      isPublished: m.isPublished,
      isFeatured: m.isFeatured,
      viewsCount: m.viewsCount,
      downloadsCount: m.downloadsCount,
      createdAt: m.createdAt.toISOString(),
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map((obj: any) =>
        Object.values(obj)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      );
      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="cineverse-movies.csv"');
      return res.status(200).send(csv);
    }

    return res.status(200).json({ success: true, data: exportData });
  } catch (error) {
    console.error('exportMovies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export movies' });
  }
}
