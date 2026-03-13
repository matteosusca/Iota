import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

// GET /api/user/me
router.get('/me', UserController.getMe);

export default router;
