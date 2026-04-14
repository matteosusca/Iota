import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFindMany, mockUpdate, mockSendNotification } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpdate: vi.fn(),
  mockSendNotification: vi.fn(),
}));

// Mocking dependencies
vi.mock('web-push', () => {
  return {
    default: {
      sendNotification: mockSendNotification,
      setVapidDetails: vi.fn(),
    }
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      user = {
        findMany: mockFindMany,
        update: mockUpdate,
      }
    }
  };
});

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(),
  }
}));

import { notificationCron } from '../notifications.cron';
import webpush from 'web-push';

describe('notifications.cron', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find users with completion < 50% and send notifications', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        pushSubscription: { endpoint: 'https://push.com/1' },
        dailyLogs: [
          { completionPercentage: 20 }
        ]
      }
    ];

    mockFindMany.mockResolvedValue(mockUsers);
    mockSendNotification.mockResolvedValue({});

    await notificationCron.checkAndSendReminders();

    expect(mockFindMany).toHaveBeenCalled();
    expect(mockSendNotification).toHaveBeenCalledWith(
      mockUsers[0].pushSubscription,
      expect.stringContaining('KaizenFit')
    );
  });

  it('should not send if user has completion >= 50%', async () => {
    mockFindMany.mockResolvedValue([]);

    await notificationCron.checkAndSendReminders();

    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});
