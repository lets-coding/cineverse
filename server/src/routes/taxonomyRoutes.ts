import { Router } from 'express';
import {
  getGenres,
  getIndustries,
  getCountries,
  getLanguages,
} from '../controllers/taxonomyController.js';

const router = Router();

router.get('/genres', getGenres);
router.get('/industries', getIndustries);
router.get('/countries', getCountries);
router.get('/languages', getLanguages);

export default router;
