import type { PrismaDatabaseClient } from "../../common/persistence/index.js";
import { getPrismaClient } from "../../prisma/index.js";
import type { ProfileSummary } from "./profile.types.js";

export interface ProfilesRepository {
  findByUserId(userId: string): Promise<ProfileSummary | null>;
  listByUserIds(userIds: string[]): Promise<ProfileSummary[]>;
}

export class PrismaProfilesRepository implements ProfilesRepository {
  constructor(
    private readonly prisma: PrismaDatabaseClient = getPrismaClient()
  ) {}

  async findByUserId(userId: string): Promise<ProfileSummary | null> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId
      },
      select: {
        userId: true,
        displayName: true,
        avatarKey: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            authType: true,
            email: true,
            lastSeenAt: true
          }
        }
      }
    });

    if (!profile) {
      return null;
    }

    return {
      userId: profile.userId,
      authType: profile.user.authType,
      email: profile.user.email,
      displayName: profile.displayName,
      avatarKey: profile.avatarKey,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      lastSeenAt: profile.user.lastSeenAt
    };
  }

  async listByUserIds(userIds: string[]): Promise<ProfileSummary[]> {
    if (userIds.length === 0) {
      return [];
    }

    const profiles = await this.prisma.profile.findMany({
      where: {
        userId: {
          in: userIds
        }
      },
      orderBy: {
        displayName: "asc"
      },
      select: {
        userId: true,
        displayName: true,
        avatarKey: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            authType: true,
            email: true,
            lastSeenAt: true
          }
        }
      }
    });

    return profiles.map((profile) => ({
      userId: profile.userId,
      authType: profile.user.authType,
      email: profile.user.email,
      displayName: profile.displayName,
      avatarKey: profile.avatarKey,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      lastSeenAt: profile.user.lastSeenAt
    }));
  }
}