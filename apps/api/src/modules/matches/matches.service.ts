import type { MatchListOptions, MatchListResult, MatchSummary } from "./match.types.js";
import {
  PrismaMatchesRepository,
  type MatchesRepository
} from "./matches.repository.js";

export class MatchesService {
  constructor(
    private readonly matchesRepository: MatchesRepository =
      new PrismaMatchesRepository()
  ) {}

  getMatchById(matchId: string): Promise<MatchSummary | null> {
    return this.matchesRepository.findById(matchId);
  }

  listRecentMatches(options: MatchListOptions = {}): Promise<MatchListResult> {
    return this.matchesRepository.listRecent(options);
  }
}