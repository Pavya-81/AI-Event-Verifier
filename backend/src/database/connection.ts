import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });

    (prismaInstance as any).$on('query', (e: { query: string; duration: number }) => {
      logger.debug(`Query: ${e.query}\nDuration: ${e.duration}ms`);
    });
  }

  return prismaInstance;
};

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✓ Database connection successful');
    return true;
  } catch (error) {
    logger.error('✗ Database connection failed', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    logger.info('Database connection closed');
  }
};
