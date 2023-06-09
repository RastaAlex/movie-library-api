import express from 'express';
import multer from 'multer';
import moviesController from '../controllers/moviesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ dest: 'tmp/uploads/' });
const router = express.Router();

router.use(authMiddleware);

router.post('/api/v1/movies', moviesController.addMovie);
router.delete('/api/v1/movies/:id', moviesController.deleteMovie);
router.patch('/api/v1/movies/:id', moviesController.updateMovie);
router.get('/api/v1/movies/:id', moviesController.getMovie);
router.get('/api/v1/movies', moviesController.getMovies);
router.post('/api/v1/movies/import', upload.single('file'), moviesController.importMovies);

export default router;
