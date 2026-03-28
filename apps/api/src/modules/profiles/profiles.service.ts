import type { ProfileSummary } from "./profile.types.js";
import {
  PrismaProfilesRepository,
  type ProfilesRepository
} from "./profiles.repository.js";

export class ProfilesService {
  constructor(
    private readonly profilesRepository: ProfilesRepository =
      new PrismaProfilesRepository()
  ) {}

  getProfileByUserId(userId: string): Promise<ProfileSummary | null> {
    return this.profilesRepository.findByUserId(userId);
  }

  listProfilesByUserIds(userIds: string[]): Promise<ProfileSummary[]> {
    return this.profilesRepository.listByUserIds(userIds);
  }
}