import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, passwordHashRaw: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordHashRaw, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    const token = this.generateToken(user.id);

    return { user: { id: user.id, email: user.email }, token };
  }

  async login(email: string, passwordHashRaw: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(passwordHashRaw, user.passwordHash);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return { user: { id: user.id, email: user.email }, token };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '30d',
    });
  }
}
