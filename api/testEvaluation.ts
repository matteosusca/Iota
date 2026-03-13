import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { StreakService } from './src/services/streak.service';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing evaluation manually...');
  const users = await prisma.user.findMany();
  for (const user of users) {
    const res = await StreakService.evaluateYesterday(user.id);
    console.log('Result:', res);
  }
}

main().then(() => prisma.$disconnect());
