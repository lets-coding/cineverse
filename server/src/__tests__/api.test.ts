import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('CineVerse Backend API Integration Tests', () => {
  let adminToken = '';
  let userToken = '';

  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.app).toBe('CineVerse');
  });

  it('POST /api/auth/login with valid admin credentials should return JWT token and role ADMIN', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@cineverse.com', password: 'AdminPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('ADMIN');
    adminToken = res.body.data.token;
  });

  it('POST /api/auth/login with valid user credentials should return role USER', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@cineverse.com', password: 'UserPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('USER');
    userToken = res.body.data.token;
  });

  it('GET /api/admin/stats should block unauthenticated visitors with 401', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/stats should block regular USER with 403', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/stats should allow ADMIN and return overview statistics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMovies).toBeGreaterThan(0);
    expect(res.body.data.totalCategories).toBeGreaterThan(0);
  });

  it('GET /api/movies should return paginated list of published movies', async () => {
    const res = await request(app).get('/api/movies?page=1&limit=6');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('GET /api/movies with filter genre=sci-fi should return filtered movies', async () => {
    const res = await request(app).get('/api/movies?genre=sci-fi');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const movie of res.body.data) {
      const genres = movie.genres.map((g: any) => g.slug);
      expect(genres).toContain('sci-fi');
    }
  });

  it('GET /api/movies/slug/tears-of-steel should return movie details with video sources and download sources', async () => {
    const res = await request(app).get('/api/movies/slug/tears-of-steel');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Tears of Steel');
    expect(res.body.data.videoSources.length).toBeGreaterThan(0);
    expect(res.body.data.downloadSources.length).toBeGreaterThan(0);
  });

  it('POST /api/movies/:id/view should increment view count', async () => {
    const movieRes = await request(app).get('/api/movies/slug/tears-of-steel');
    const movieId = movieRes.body.data.id;

    const res = await request(app).post(`/api/movies/${movieId}/view`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.viewsCount).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/movies/:id/download/:downloadId should return authorized download details', async () => {
    const movieRes = await request(app).get('/api/movies/slug/tears-of-steel');
    const movieId = movieRes.body.data.id;
    const downloadId = movieRes.body.data.downloadSources[0].id;

    const res = await request(app).post(`/api/movies/${movieId}/download/${downloadId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.downloadUrl).toBeDefined();
    expect(res.body.data.qualityLabel).toBeDefined();
  });
});
