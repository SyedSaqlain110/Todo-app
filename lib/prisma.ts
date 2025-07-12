// lib/prisma.ts
import { PrismaClient } from '../src/generated/prisma'; // Adjusted import path for your setup

// Declare a global variable to store the PrismaClient instance
// This is necessary to prevent multiple instances of PrismaClient in development (hot-reloading)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// This pattern ensures that a single PrismaClient instance is reused
// across hot-reloads in development, and a new instance is created
// for each deployment in production (where hot-reloading doesn't apply).
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, we store the PrismaClient instance on the global object
  // to prevent it from being re-instantiated on every hot-reload.
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Export the singleton PrismaClient instance
export default prisma;
