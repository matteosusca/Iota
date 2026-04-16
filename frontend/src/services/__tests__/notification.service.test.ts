import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from '../notification.service';
import { apiService } from '../api.service';

vi.mock('../api.service', () => ({
  apiService: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('notification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global browser APIs
    (global as any).Notification = {
      permission: 'default',
      requestPermission: vi.fn(),
    };

    (global as any).atob = vi.fn().mockReturnValue('mock-decoded');
    
    (global as any).navigator.serviceWorker = {
      ready: Promise.resolve({
        pushManager: {
          subscribe: vi.fn(),
          getSubscription: vi.fn(),
        },
      }),
    };
  });

  it('should request permission and return true if granted', async () => {
    (global.Notification.requestPermission as any).mockResolvedValue('granted');
    
    const result = await notificationService.requestPermission();
    
    expect(global.Notification.requestPermission).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not request if permission is already granted', async () => {
    (global.Notification as any).permission = 'granted';
    
    const result = await notificationService.requestPermission();
    
    expect(global.Notification.requestPermission).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should subscribe and send to backend', async () => {
    const mockSubscription = { endpoint: 'https://push.com' };
    const mockServiceWorker = await (navigator.serviceWorker as any).ready;
    (mockServiceWorker.pushManager.subscribe as any).mockResolvedValue(mockSubscription);
    
    // Mock VAPID config response
    (apiService.get as any).mockResolvedValue({ publicKey: 'mock-public-key' });
    (apiService.post as any).mockResolvedValue({ success: true });

    await notificationService.subscribeUser();

    expect(apiService.get).toHaveBeenCalledWith('/api/v1/config/vapid');
    expect(mockServiceWorker.pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: expect.any(Uint8Array),
    });
    expect(apiService.post).toHaveBeenCalledWith('/api/v1/notifications/subscribe', {
      subscription: mockSubscription
    });
  });
});
