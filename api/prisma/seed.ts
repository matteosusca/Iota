import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean up existing data to ensure idempotency
  await prisma.dailyLog.deleteMany();
  await prisma.routineExercise.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Test User
  const testUser = await prisma.user.create({
    data: {
      id: '927d8b9b-d72b-4227-9fa3-4dd38cc50540',
      email: 'test@kaizenfit.app',
      passwordHash: 'hashed_password_placeholder', // Dummy password
      coins: 100,
      streakFreezes: 2,
      currentStreak: 5,
    },
  });
  console.log(`Created test user with id: ${testUser.id}`);

  // 3. Create Exercises
  const pushups = await prisma.exercise.create({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Push-ups',
      type: 'counter',
    },
  });
  console.log(`Created exercise: ${pushups.name} (${pushups.type})`);

  const stretching = await prisma.exercise.create({
    data: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Stretching',
      type: 'timer',
    },
  });
  console.log(`Created exercise: ${stretching.name} (${stretching.type})`);

  // 4. Create Routine (Connect User to Exercises with JSON Targets)
  await prisma.routineExercise.create({
    data: {
      userId: testUser.id,
      exerciseId: pushups.id,
      targetMetrics: { reps: 20 },
    },
  });

  await prisma.routineExercise.create({
    data: {
      userId: testUser.id,
      exerciseId: stretching.id,
      targetMetrics: { seconds_elapsed: 300 }, // 5 minutes
    },
  });
  console.log(`Connected exercises to user routine with targets.`);

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
