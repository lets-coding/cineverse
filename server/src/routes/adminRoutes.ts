import { Router } from 'express';
import {
  getDashboardStats,
  getAdminMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  togglePublish,
  toggleFeatured,
  bulkActions,
  exportMovies,
  movieFormSchema,
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.use(requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Movie CRUD
router.get('/movies', getAdminMovies);
router.post('/movies', validateBody(movieFormSchema), createMovie);
router.put('/movies/:id', validateBody(movieFormSchema), updateMovie);
router.delete('/movies/:id', deleteMovie);

// Quick Toggles
router.patch('/movies/:id/publish', togglePublish);
router.patch('/movies/:id/featured', toggleFeatured);

// Bulk Operations
router.post('/movies/bulk', bulkActions);

// Exports
router.get('/movies/export', exportMovies);

// Simulated secure file upload endpoint
router.post('/upload', (req, res) => {
  // In a real S3 / Cloudflare R2 setup, this generates a pre-signed URL or receives file stream
  const { fileName, fileType } = req.body;
  return res.status(200).json({
    success: true,
    message: 'Upload URL generated successfully',
    data: {
      fileUrl: `https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop`,
      storageKey: `cineverse/media/${Date.now()}-${fileName || 'asset.jpg'}`,
    },
  });
});

export default router;
