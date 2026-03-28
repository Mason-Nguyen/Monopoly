import "dotenv/config";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { getPrismaClient, isPrismaConfigured } from "./client.js";

interface DemoSeedUser {
  id: string;
  authType: "local";
  email: string;
  passwordHash: string;
  displayName: string;
  avatarKey?: string;
  lastSeenAt?: Date;
  leaderboard: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    bankruptcies: number;
    abandons: number;
    lastMatchAt?: Date;
  };
}

const DEMO_USERS: DemoSeedUser[] = [
  {
    id: "f915889c-f7ad-4823-894e-c3ac0ebc4ee5",
    authType: "local",
    email: "an.dev@monopoly.local",
    passwordHash: "dev-local-password-hash-placeholder",
    displayName: "An",
    avatarKey: "token-car",
    lastSeenAt: new Date("2026-03-20T10:00:00.000Z"),
    leaderboard: {
      matchesPlayed: 12,
      wins: 4,
      losses: 8,
      bankruptcies: 3,
      abandons: 0,
      lastMatchAt: new Date("2026-03-20T10:00:00.000Z")
    }
  },
  {
    id: "552f1fb2-b22c-44c5-bbc9-e4b7a412a328",
    authType: "local",
    email: "binh.dev@monopoly.local",
    passwordHash: "dev-local-password-hash-placeholder",
    displayName: "Binh",
    avatarKey: "token-ship",
    lastSeenAt: new Date("2026-03-21T12:30:00.000Z"),
    leaderboard: {
      matchesPlayed: 18,
      wins: 7,
      losses: 11,
      bankruptcies: 4,
      abandons: 1,
      lastMatchAt: new Date("2026-03-21T12:30:00.000Z")
    }
  },
  {
    id: "19d03ac4-51d1-4bb1-aefa-321c9d9fc9f4",
    authType: "local",
    email: "chi.dev@monopoly.local",
    passwordHash: "dev-local-password-hash-placeholder",
    displayName: "Chi",
    avatarKey: "token-hat",
    lastSeenAt: new Date("2026-03-22T09:15:00.000Z"),
    leaderboard: {
      matchesPlayed: 9,
      wins: 3,
      losses: 6,
      bankruptcies: 2,
      abandons: 0,
      lastMatchAt: new Date("2026-03-22T09:15:00.000Z")
    }
  },
  {
    id: "b31f1ca7-d58c-463f-b0ca-52e56c944943",
    authType: "local",
    email: "dung.dev@monopoly.local",
    passwordHash: "dev-local-password-hash-placeholder",
    displayName: "Dung",
    avatarKey: "token-thimble",
    lastSeenAt: new Date("2026-03-23T14:45:00.000Z"),
    leaderboard: {
      matchesPlayed: 14,
      wins: 5,
      losses: 9,
      bankruptcies: 1,
      abandons: 1,
      lastMatchAt: new Date("2026-03-23T14:45:00.000Z")
    }
  },
  {
    id: "3014a01c-9b19-4679-81b7-980f039f18aa",
    authType: "local",
    email: "giang.dev@monopoly.local",
    passwordHash: "dev-local-password-hash-placeholder",
    displayName: "Giang",
    avatarKey: "token-wheelbarrow",
    lastSeenAt: new Date("2026-03-24T08:05:00.000Z"),
    leaderboard: {
      matchesPlayed: 20,
      wins: 9,
      losses: 11,
      bankruptcies: 5,
      abandons: 0,
      lastMatchAt: new Date("2026-03-24T08:05:00.000Z")
    }
  },
  {
    id: "ce7243f6-6819-4644-8477-b4f9213be6aa",
    authType: "local",
    email: "huy.dev@monopoly.local",
    passwordHash: "dev-local-password-hash-placeholder",
    displayName: "Huy",
    avatarKey: "token-dog",
    lastSeenAt: new Date("2026-03-25T16:20:00.000Z"),
    leaderboard: {
      matchesPlayed: 11,
      wins: 2,
      losses: 9,
      bankruptcies: 4,
      abandons: 2,
      lastMatchAt: new Date("2026-03-25T16:20:00.000Z")
    }
  }
];

async function upsertDemoUser(prisma: PrismaClient, user: DemoSeedUser): Promise<void> {
  await prisma.user.upsert({
    where: {
      id: user.id
    },
    create: {
      id: user.id,
      authType: user.authType,
      email: user.email,
      passwordHash: user.passwordHash,
      lastSeenAt: user.lastSeenAt
    },
    update: {
      authType: user.authType,
      email: user.email,
      passwordHash: user.passwordHash,
      lastSeenAt: user.lastSeenAt
    }
  });

  await prisma.profile.upsert({
    where: {
      userId: user.id
    },
    create: {
      userId: user.id,
      displayName: user.displayName,
      avatarKey: user.avatarKey
    },
    update: {
      displayName: user.displayName,
      avatarKey: user.avatarKey
    }
  });

  await prisma.leaderboardStat.upsert({
    where: {
      userId: user.id
    },
    create: {
      userId: user.id,
      matchesPlayed: user.leaderboard.matchesPlayed,
      wins: user.leaderboard.wins,
      losses: user.leaderboard.losses,
      bankruptcies: user.leaderboard.bankruptcies,
      abandons: user.leaderboard.abandons,
      lastMatchAt: user.leaderboard.lastMatchAt
    },
    update: {
      matchesPlayed: user.leaderboard.matchesPlayed,
      wins: user.leaderboard.wins,
      losses: user.leaderboard.losses,
      bankruptcies: user.leaderboard.bankruptcies,
      abandons: user.leaderboard.abandons,
      lastMatchAt: user.leaderboard.lastMatchAt
    }
  });
}

async function main(): Promise<void> {
  if (!isPrismaConfigured()) {
    throw new Error("DATABASE_URL is required before running Prisma seed.");
  }

  const prisma = getPrismaClient();

  console.info("[seed] Starting Prisma development seed...");

  for (const user of DEMO_USERS) {
    await upsertDemoUser(prisma, user);
  }

  console.info(`[seed] Seed completed. Upserted ${DEMO_USERS.length} demo users.`);
}

main()
  .catch((error: unknown) => {
    console.error("[seed] Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (isPrismaConfigured()) {
      await getPrismaClient().$disconnect();
    }
  });