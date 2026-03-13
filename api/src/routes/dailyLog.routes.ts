import { Router } from 'express';
import { DailyLogController } from '../controllers/dailyLog.controller';

const router = Router();

// Define the POST route for logs
router.post('/logs', DailyLogController.createLog);

// Define the GET route for logs history
router.get('/logs/history', DailyLogController.getHistory);

export default router;
