import { mockBadges, mockAchievements } from '@/lib/mock/mockMissions';

export async function GET() {
  return Response.json({ badges: mockBadges, achievements: mockAchievements });
}
