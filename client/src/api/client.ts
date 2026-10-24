import {
  User,
  Movie,
  MovieDetail,
  Genre,
  Industry,
  Country,
  Language,
  DashboardStats,
  MovieFilterParams,
} from '../types/index.js';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('cineverse_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  }

  // Auth Endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; data: { token: string; user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(payload: { name: string; email: string; password: string }) {
    return this.request<{ success: boolean; data: { token: string; user: User } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: User }>('/auth/me');
  }

  async updateProfile(payload: { name?: string; avatar?: string }) {
    return this.request<{ success: boolean; data: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteAccount() {
    return this.request<{ success: boolean; message: string }>('/auth/account', {
      method: 'DELETE',
    });
  }

  // Movies Endpoints
  async getMovies(params: MovieFilterParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    return this.request<{
      success: boolean;
      data: Movie[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/movies?${query.toString()}`);
  }

  async getHomeSections() {
    return this.request<{
      success: boolean;
      data: {
        hero: Movie | null;
        trending: Movie[];
        popular: Movie[];
        topRated: Movie[];
        recentlyAdded: Movie[];
      };
    }>('/movies/sections');
  }

  async getMovieBySlug(slug: string) {
    return this.request<{ success: boolean; data: MovieDetail }>(`/movies/slug/${slug}`);
  }

  async recordView(id: string) {
    return this.request<{ success: boolean; viewsCount: number }>(`/movies/${id}/view`, {
      method: 'POST',
    });
  }

  async getAuthorizedDownload(movieId: string, downloadId: string) {
    return this.request<{
      success: boolean;
      data: {
        title: string;
        qualityLabel: string;
        resolution: string;
        fileSize: string;
        format: string;
        downloadUrl: string;
      };
    }>(`/movies/${movieId}/download/${downloadId}`, {
      method: 'POST',
    });
  }

  // Taxonomy Endpoints
  async getGenres() {
    return this.request<{ success: boolean; data: Genre[] }>('/taxonomy/genres');
  }

  async getIndustries() {
    return this.request<{ success: boolean; data: Industry[] }>('/taxonomy/industries');
  }

  async getCountries() {
    return this.request<{ success: boolean; data: Country[] }>('/taxonomy/countries');
  }

  async getLanguages() {
    return this.request<{ success: boolean; data: Language[] }>('/taxonomy/languages');
  }

  // Personalization / User Endpoints
  async getWatchlist() {
    return this.request<{ success: boolean; data: Movie[] }>('/user/watchlist');
  }

  async toggleWatchlist(movieId: string) {
    return this.request<{ success: boolean; isInWatchlist: boolean; message: string }>(
      `/user/watchlist/${movieId}`,
      { method: 'POST' }
    );
  }

  async getFavorites() {
    return this.request<{ success: boolean; data: Movie[] }>('/user/favorites');
  }

  async toggleFavorite(movieId: string) {
    return this.request<{ success: boolean; isFavorite: boolean; message: string }>(
      `/user/favorites/${movieId}`,
      { method: 'POST' }
    );
  }

  async getWatchHistory() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        progressSeconds: number;
        durationSeconds: number;
        percentage: number;
        completed: boolean;
        lastWatchedAt: string;
        movie: Movie;
      }[];
    }>('/user/history');
  }

  async saveProgress(movieId: string, progressSeconds: number, durationSeconds: number) {
    return this.request<{ success: boolean; data: any }>('/user/history', {
      method: 'POST',
      body: JSON.stringify({ movieId, progressSeconds, durationSeconds }),
    });
  }

  async addReview(movieId: string, rating: number, comment: string) {
    return this.request<{ success: boolean; data: any; message: string }>(
      `/user/movies/${movieId}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      }
    );
  }

  // Admin Endpoints
  async getAdminStats() {
    return this.request<{ success: boolean; data: DashboardStats }>('/admin/stats');
  }

  async getAdminMovies(page = 1, search = '', status = '') {
    const query = new URLSearchParams({ page: String(page), search, status });
    return this.request<{
      success: boolean;
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/movies?${query.toString()}`);
  }

  async createMovie(data: any) {
    return this.request<{ success: boolean; message: string; data: Movie }>('/admin/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMovie(id: string, data: any) {
    return this.request<{ success: boolean; message: string; data: Movie }>(`/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMovie(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/movies/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePublish(id: string) {
    return this.request<{ success: boolean; data: { id: string; isPublished: boolean } }>(
      `/admin/movies/${id}/publish`,
      { method: 'PATCH' }
    );
  }

  async toggleFeatured(id: string) {
    return this.request<{ success: boolean; data: { id: string; isFeatured: boolean } }>(
      `/admin/movies/${id}/featured`,
      { method: 'PATCH' }
    );
  }

  async bulkActions(action: 'publish' | 'unpublish' | 'delete', movieIds: string[]) {
    return this.request<{ success: boolean; message: string }>('/admin/movies/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, movieIds }),
    });
  }
}

export const api = new ApiClient();
