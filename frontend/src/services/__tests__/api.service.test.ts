import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../api.service';

describe('ApiService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should timeout after 10 seconds by default', async () => {
    (fetch as any).mockImplementation((url: string, options: any) => {
        return new Promise((_resolve, reject) => {
            if (options?.signal) {
                options.signal.addEventListener('abort', () => {
                    const error = new Error('Aborted');
                    error.name = 'AbortError';
                    reject(error);
                });
            }
            // Do not resolve
        });
    });

    const request = apiService.get('/test');
    
    // Fast forward 11 seconds
    vi.advanceTimersByTime(11000);

    await expect(request).rejects.toThrow('Request timed out');
  }, 10000);

  it('should clear timeout when request succeeds', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'ok' })
    });

    await apiService.get('/test');
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
