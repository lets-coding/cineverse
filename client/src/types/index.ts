export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string | null;
  createdAt?: string;
  _count?: {
    watchlist: number;
    favorites: number;
    reviews: number;
  };
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  movieCount?: number;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  movieCount?: number;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  movieCount?: number;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  isAudio?: boolean;
  isSubtitle?: boolean;
}

export interface Person {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string | null;
}

export interface MovieCredit {
  id: string;
  role: string;
  characterName?: string | null;
  person: Person;
}

export interface VideoSource {
  id: string;
  format: string; // 'hls' | 'mp4'
  streamUrl: string;
  qualityLabel: string;
  isPrimary: boolean;
  duration?: number | null;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  vttUrl: string;
  isDefault: boolean;
}

export interface DownloadSource {
  id: string;
  qualityLabel: string;
  resolution: string;
  fileSize: string;
  format: string;
  downloadUrl: string;
  accessType: string;
  downloadsCount?: number;
}

export interface Review {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string | null;
  slug: string;
  description: string;
  synopsis?: string;
  releaseYear: number;
  releaseDate?: string | null;
  contentType: string; // MOVIE, SERIES, SHORT_FILM, DOCUMENTARY
  runtime: number;
  ageRating: string;
  externalRating?: number | null;
  ratingSource?: string | null;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string | null;
  searchKeywords?: string | null;
  isFeatured: boolean;
  isPublished?: boolean;
  downloadEnabled: boolean;
  viewsCount?: number;
  downloadsCount?: number;
  genres: Genre[];
  industries?: Industry[];
  availableQualities?: string[];
}

export interface MovieDetail extends Movie {
  synopsis: string;
  countries: Country[];
  industries: Industry[];
  languages: Language[];
  credits: MovieCredit[];
  videoSources: VideoSource[];
  subtitleTracks: SubtitleTrack[];
  downloadSources: DownloadSource[];
  reviews: Review[];
  isInWatchlist: boolean;
  isFavorite: boolean;
  userProgress: number;
  recommendations: Movie[];
}

export interface DashboardStats {
  totalMovies: number;
  publishedMovies: number;
  draftMovies: number;
  totalCategories: number;
  totalUsers: number;
  totalViews: number;
  totalDownloads: number;
  recentMovies: {
    id: string;
    title: string;
    slug: string;
    releaseYear: number;
    isPublished: boolean;
    isFeatured: boolean;
    createdAt: string;
    posterUrl: string;
  }[];
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    details?: string | null;
    createdAt: string;
    admin: {
      name: string;
      email: string;
    };
  }[];
}

export interface MovieFilterParams {
  page?: number;
  limit?: number;
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
  sort?: string;
  featured?: string;
}
