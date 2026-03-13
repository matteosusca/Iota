import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import dailyLogRoutes from './routes/dailyLog.routes';
import userRoutes from './routes/user.routes';
import { startDailyEvaluationCron } from './cron/dailyEvaluation.cron';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api', dailyLogRoutes);
app.use('/api/user', userRoutes);

// Start Cron Jobs
startDailyEvaluationCron();

app.get('/', (req, res) => {
  res.send('KaizenFit API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
