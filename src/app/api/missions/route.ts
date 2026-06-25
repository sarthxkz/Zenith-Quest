import { NextRequest } from 'next/server';
import { generateMissions } from '@/lib/services/missionGenerator';
import { mockPlanets } from '@/lib/mock/mockAstronomy';
import { mockSatellitePasses } from '@/lib/mock/mockSatellites';
import { mockMissions } from '@/lib/mock/mockMissions';

export async function GET() {
  try {
    const missions = mockMissions;
    return Response.json({ missions });
  } catch (error) {
    console.error('Missions API error:', error);
    return Response.json({ error: 'Failed to fetch missions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, missionId } = body;

    if (action === 'start') {
      return Response.json({ success: true, message: `Mission ${missionId} started` });
    }
    if (action === 'complete') {
      return Response.json({ success: true, message: `Mission ${missionId} completed`, xpEarned: 100 });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Missions POST error:', error);
    return Response.json({ error: 'Failed to update mission' }, { status: 500 });
  }
}
