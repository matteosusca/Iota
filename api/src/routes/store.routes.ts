import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';

const router = Router();

router.post('/buy-freeze', StoreController.buyFreeze);

export default router;
