import { NextRequest } from 'next/server';
import { generateAISummary, generateAISummaryWithOpenAI } from '@/lib/services/aiSummaryGenerator';
import { fetchPlanetPositions, fetchMoonPhase } from '@/lib/services/astronomyService';
import { fetchSatellitesAbove } from '@/lib/services/satelliteService';
import { fetchWeather } from '@/lib/services/weatherService';
import { calculateSkyScore } from '@/lib/services/skyScoreEngine';
import { mockMoonPhase } from '@/lib/mock/mockAstronomy';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '40.7128');
  const lng = parseFloat(searchParams.get('lng') || '-74.006');

  try {
    const [weather, planets, moonPhase, satellites] = await Promise.all([
      fetchWeather(lat, lng),
      fetchPlanetPositions(lat, lng),
      fetchMoonPhase(lat, lng),
      fetchSatellitesAbove(lat, lng),
    ]);

    const activeMoon = moonPhase || mockMoonPhase;
    const skyScore = calculateSkyScore(weather, activeMoon, planets, satellites.length);

    // Try OpenAI first
    const prompt = `Sky conditions: Cloud cover ${weather.cloudCover}%, visibility ${weather.visibility}km, temperature ${weather.temperature}°C. Moon: ${activeMoon.phase} (${activeMoon.illumination}% illuminated). Visible planets: ${planets.filter(p => p.isVisible).map(p => p.name).join(', ')}. ISS/Satellites overhead: ${satellites.length}. Sky Score: ${skyScore.overall}/100 (${skyScore.rating}).`;

    const aiSummary = await generateAISummaryWithOpenAI(prompt);

    if (aiSummary) {
      return Response.json({ summary: aiSummary, source: 'openai' });
    }

    // Fallback to algorithmic summary
    const summary = generateAISummary(weather, activeMoon, planets, [], skyScore);
    return Response.json({ summary, source: 'algorithmic' });
  } catch (error) {
    console.error('AI summary error:', error);
    return Response.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
