import { Request, Response } from 'express';
import { prisma } from '../services/db.js';

export async function getGenres(req: Request, res: Response) {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { movies: true },
        },
      },
    });

    const formatted = genres.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      movieCount: g._count.movies,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getGenres error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve genres' });
  }
}

export async function getIndustries(req: Request, res: Response) {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { movies: true },
        },
      },
    });

    const formatted = industries.map((i) => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      movieCount: i._count.movies,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getIndustries error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve industries' });
  }
}

export async function getCountries(req: Request, res: Response) {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { movies: true },
        },
      },
    });

    const formatted = countries.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      movieCount: c._count.movies,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getCountries error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve countries' });
  }
}

export async function getLanguages(req: Request, res: Response) {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ success: true, data: languages });
  } catch (error) {
    console.error('getLanguages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve languages' });
  }
}
