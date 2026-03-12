import { Request, Response } from 'express';
import { DailyLogService } from '../services/dailyLog.service';

export class DailyLogController {
  
  static async createLog(req: Request, res: Response) {
    try {
      const { userId, exerciseId, date, metrics } = req.body;

      // Basic I/O validation (Controller responsibility)
      if (!userId || !exerciseId || !date || !metrics) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, exerciseId, date, metrics' 
        });
      }

      // Delegate core validation and saving to the Service
      const log = await DailyLogService.createLog(userId, exerciseId, date, metrics);
      
      return res.status(201).json({
        message: 'Daily Log created successfully.',
        data: log
      });

    } catch (error: any) {
      console.error('Error creating Daily Log:', error.message);
      
      // Return 400 for validation errors or missing resources
      return res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
  }
}
