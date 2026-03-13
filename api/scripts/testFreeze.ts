import { PrismaClient } from '@prisma/client';
import { StreakService } from '../src/services/streak.service';

const prisma = new PrismaClient();

async function testFreeze() {
  const userId = '927d8b9b-d72b-4227-9fa3-4dd38cc50540';
  
  // 0. Ensure no logs for yesterday so we definitely "Failed"
  await prisma.dailyLog.deleteMany({});
  
  // 1. Give the user a freeze and 100 coins
  await prisma.user.update({
    where: { id: userId },
    data: { streakFreezes: 1, coins: 100, currentStreak: 5 }
  });
  
  console.log('User state reset. Executing evaluateYesterday (should fail but consume freeze)...');
  
  // 2. Evaluate yesterday (assuming no logs exist for yesterday because it's a test db)
  const result = await StreakService.evaluateYesterday(userId);
  console.log('Evaluation Result:', result);
  
  // 3. Verify
  const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
  console.log('Updated user stats:', {
    streak: updatedUser?.currentStreak,
    freezes: updatedUser?.streakFreezes,
  });

  const summaries = await prisma.dailySummary.findMany({ where: { userId } });
  console.log('Daily summaries:', summaries);
}

testFreeze()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
