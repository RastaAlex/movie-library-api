import express from 'express';
import usersController from '../controllers/usersController.js';

const router = express.Router();

router.post('/api/v1/users', usersController.register);
router.post('/api/v1/sessions', usersController.login);

export default router;
