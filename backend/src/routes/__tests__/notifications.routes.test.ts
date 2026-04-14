import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocking Prisma Client
vi.mock('@prisma/client', () => {
  const mockUpdate = vi.fn();
  return {
    PrismaClient: class {
      user = {
        update: mockUpdate
      }
    }
  };
});

import notificationsRoutes from '../notifications.routes';
import { PrismaClient } from '@prisma/client';

describe('notifications.routes', () => {
  let fastify: any;
  let prisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = new PrismaClient();
    fastify = {
      post: vi.fn(),
      jwt: {
        verify: vi.fn(),
      },
      authenticate: vi.fn(),
      addHook: vi.fn(),
    };
  });

  it('should register POST /api/v1/notifications/subscribe with authenticate', async () => {
    await notificationsRoutes(fastify as any);
    expect(fastify.post).toHaveBeenCalledWith(
      '/api/v1/notifications/subscribe',
      expect.objectContaining({ preValidation: [fastify.authenticate] }),
      expect.any(Function)
    );
  });

  it('should update user push subscription', async () => {
    const mockRequest = {
      user: { id: 'user-id' },
      body: { subscription: { endpoint: 'https://example.com' } },
    };
    const mockReply = {
      send: vi.fn().mockReturnThis(),
    };

    // Simulate the route handler execution
    let handler: Function;
    fastify.post.mockImplementation((path: string, options: any, h: Function) => {
      if (path === '/api/v1/notifications/subscribe') handler = h;
    });

    await notificationsRoutes(fastify as any);
    
    // Call the handler
    // @ts-ignore
    await handler(mockRequest, mockReply);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { pushSubscription: mockRequest.body.subscription },
    });
    expect(mockReply.send).toHaveBeenCalledWith({ success: true });
  });
});
