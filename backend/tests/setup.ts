// Test setup file
import { getPrismaClient } from '../src/database/connection';

beforeAll(async () => {
  // Setup test database connection
  const prisma = getPrismaClient();
  // Add any global test setup here
});

afterAll(async () => {
  // Cleanup
  const prisma = getPrismaClient();
  await prisma.$disconnect();
});
