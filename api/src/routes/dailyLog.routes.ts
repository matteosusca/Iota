import { Router } from 'express';
import { DailyLogController } from '../controllers/dailyLog.controller';

const router = Router();

// Define the POST route for logs
router.post('/logs', DailyLogController.createLog);

export default router;
