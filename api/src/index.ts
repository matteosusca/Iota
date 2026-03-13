import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import dailyLogRoutes from './routes/dailyLog.routes';
import userRoutes from './routes/user.routes';
import storeRoutes from './routes/store.routes';
import authRoutes from './routes/auth.routes';
import { authenticateJWT } from './middleware/auth.middleware';
import { startDailyEvaluationCron } from './cron/dailyEvaluation.cron';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);

app.use('/api', authenticateJWT, dailyLogRoutes);
app.use('/api/user', authenticateJWT, userRoutes);
app.use('/api/store', authenticateJWT, storeRoutes);

// Start Cron Jobs
startDailyEvaluationCron();

app.get('/', (req, res) => {
  res.send('KaizenFit API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
