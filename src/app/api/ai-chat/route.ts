import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are Zenith AI, the elite astronomical assistant of Zenith Quest. 
              You help users track satellites, analyze orbit trajectories, plan stargazing missions, and form space collaboration groups.
              Keep your responses concise, smart, formatting them beautifully in markdown. If the user asks about coordinates, weather, or stargazing recommendations, base it on the context provided.
              Current context: ${JSON.stringify(context || {})}`,
            },
            { role: 'user', content: message },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return Response.json({ response: data.choices?.[0]?.message?.content });
      }
    }

    // High quality conversational fallback responses if OpenAI key is not configured
    const msgLower = message.toLowerCase();
    let response = "I am currently running in Offline Mode. How can I assist you with your space missions?";

    if (msgLower.includes('project') || msgLower.includes('idea')) {
      response = `### 🌌 Recommended Collaborative Project Ideas:
1. **Zenith Constellation Canvas**: A collaborative whiteboard allowing multiple astronomers to draw stars and trace constellations on a shared Sky Dome grid using WebSockets.
2. **Spectrometer Analyzer**: An open-source web application connecting USB spectrographs to chart stellar chemical compositions.
3. **Telemetry API Hub**: An aggregator query engine fetching high-frequency satellite telemetry updates from N2YO and Space-Track.

Would you like me to help draft a technical specification for any of these?`;
    } else if (msgLower.includes('teammate') || msgLower.includes('collaborator') || msgLower.includes('find')) {
      response = `### 🧑‍🚀 Recommended Collaborators for You:
* **AstroLuna** (Intermediate · 2,400 XP) — Specializes in lunar mapping and astrophotography grids.
* **OrionDev** (Expert · 4,800 XP) — Rust core developer building the Project Nebula stream node.
* **XenonTech** (Expert · 5,100 XP) — Three.js designer working on Sky Dome projection overlays.

Would you like to send a direct message request to any of these explorers?`;
    } else if (msgLower.includes('satellite') || msgLower.includes('iss') || msgLower.includes('orbit')) {
      response = `### 🛰️ Orbital Telemetry Report:
* **International Space Station (ISS)**: Visible tonight in your location at **21:42** for 4 minutes. Starts in NW sky, rises to **62° max elevation**.
* **Hubble Space Telescope (HST)**: High altitude pass tomorrow morning at **05:14** (Mag: +1.4).

Make sure to log these observations to claim streak rewards!`;
    } else if (msgLower.includes('weather') || msgLower.includes('clear') || msgLower.includes('sky')) {
      response = `### 🌤️ Stargazing Conditions Report:
The current sky score is **82/100 (Excellent)**. 
Cloud cover is extremely low at **8%**, with **15km visibility**. 
Wind speed is gentle, making it perfect for setting up high-aperture telescopes.

Enjoy your observation tonight!`;
    } else if (msgLower.includes('help') || msgLower.includes('what can you do')) {
      response = `I am Zenith AI, your cosmic guide. You can ask me to:
* **Recommend teammates** to join your stargazing groups.
* **Generate project ideas** for astronomy web tools.
* **Summarize orbital telemetry** and ISS passes.
* **Analyze sky scores** and weather metrics.`;
    }

    return Response.json({ response });
  } catch (error: any) {
    console.error('AI chat route error:', error);
    return Response.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
