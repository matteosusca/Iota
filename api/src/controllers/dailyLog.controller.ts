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

  static async getHistory(req: Request, res: Response) {
    try {
      const { month } = req.query; // YYYY-MM
      // Use seeded user for now as specified
      const userId = '927d8b9b-d72b-4227-9fa3-4dd38cc50540';

      if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Valid month query parameter is required (YYYY-MM)' });
      }

      const history = await DailyLogService.getHistory(userId, month);
      
      return res.status(200).json({ history });
    } catch (error: any) {
      console.error('Error fetching history:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
