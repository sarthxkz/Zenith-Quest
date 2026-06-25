/* ─────────────────────────────────────────────────
 * Zenith Quest — Simple Hackathon Proposal PDF
 * ─────────────────────────────────────────────────
 *   node generate-proposal.js
 * ───────────────────────────────────────────────── */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const C = {
  bg: '#0B0D1A',
  card: '#12152B',
  cardAlt: '#1A1E38',
  purple: '#8B5CF6',
  purpleL: '#A78BFA',
  cyan: '#06B6D4',
  cyanL: '#22D3EE',
  amber: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
  pink: '#EC4899',
  white: '#FFFFFF',
  t1: '#F1F5F9',
  t2: '#94A3B8',
  t3: '#64748B',
  border: '#1E293B',
};

function generate() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true,
    info: {
      Title: 'Zenith Quest — Hackathon Proposal',
      Author: 'Zenith Quest Team',
      Subject: 'Celestial Exploration Platform',
    },
  });

  const W = 595.28; // A4 width
  const H = 841.89; // A4 height
  const M = 50; // margin
  const CW = W - 2 * M; // content width
  let pageNum = 0;

  doc.pipe(fs.createWriteStream(path.join(__dirname, 'Zenith_Quest_Proposal.pdf')));

  // ── Helpers ──────────────────────────────────────

  function bg() {
    doc.rect(0, 0, W, H).fill(C.bg);
    // subtle stars
    const pts = [[50,60],[140,30],[250,80],[380,25],[480,65],[80,180],[320,150],[470,130],[100,500],[350,480],[500,400],[60,700],[250,650],[450,700],[180,350],[400,320]];
    pts.forEach(([x, y]) => {
      doc.save().opacity(0.12 + Math.random() * 0.18);
      doc.circle(x, y, 0.5 + Math.random() * 1.2).fill(C.white);
      doc.restore();
    });
  }

  function newPage() {
    if (pageNum > 0) doc.addPage();
    pageNum++;
    bg();
  }

  function footer() {
    doc.save();
    doc.moveTo(M, H - 40).lineTo(W - M, H - 40).lineWidth(0.3).stroke(C.border);
    doc.fontSize(7).fill(C.t3).text('Zenith Quest — Hackathon Proposal', M + 5, H - 32);
    doc.fontSize(7).fill(C.t3).text(`Page ${pageNum}`, W - M - 35, H - 32);
    doc.restore();
  }

  function title(text, y, color = C.purple) {
    doc.fontSize(20).fill(color).text(text, M, y);
    doc.moveTo(M, y + 28).lineTo(W - M, y + 28).lineWidth(0.5).stroke(C.border);
    return y + 40;
  }

  function sub(text, y, color = C.cyanL) {
    doc.fontSize(13).fill(color).text(text, M + 5, y);
    return y + 22;
  }

  function para(text, y, opts = {}) {
    const w = opts.width || CW;
    const x = opts.x || M + 5;
    doc.fontSize(opts.size || 10).fill(opts.color || C.t2).text(text, x, y, { width: w, lineGap: opts.lineGap || 4, align: opts.align || 'left' });
    return y + doc.heightOfString(text, { width: w, lineGap: opts.lineGap || 4 }) + (opts.gap || 10);
  }

  function bullet(text, y, color = C.purple, x = M + 15) {
    doc.circle(x, y + 5, 2.5).fill(color);
    doc.fontSize(9.5).fill(C.t1).text(text, x + 10, y, { width: CW - 30 });
    return y + doc.heightOfString(text, { width: CW - 30 }) + 6;
  }

  function card(x, y, w, h) {
    doc.roundedRect(x, y, w, h, 6).fill(C.card);
    doc.roundedRect(x, y, w, h, 6).lineWidth(0.5).stroke(C.border);
  }

  function badge(x, y, text, bg, tc = C.white) {
    const tw = doc.fontSize(8).widthOfString(text);
    const bw = tw + 14;
    doc.roundedRect(x, y, bw, 17, 8).fill(bg);
    doc.fontSize(8).fill(tc).text(text, x + 7, y + 4);
    return bw;
  }

  function box(x, y, w, h, label, borderColor = C.border, bgColor = C.cardAlt) {
    doc.roundedRect(x, y, w, h, 5).fill(bgColor);
    doc.roundedRect(x, y, w, h, 5).lineWidth(0.5).stroke(borderColor);
    doc.fontSize(8).fill(C.t1).text(label, x + 3, y + (h - 8) / 2, { width: w - 6, align: 'center' });
  }

  function arrowR(x, y, len = 20) {
    doc.moveTo(x, y).lineTo(x + len, y).lineWidth(1.2).stroke(C.cyan);
    doc.moveTo(x + len - 4, y - 3).lineTo(x + len, y).lineTo(x + len - 4, y + 3).lineWidth(1.2).stroke(C.cyan);
  }

  function arrowD(x, y, len = 20) {
    doc.moveTo(x, y).lineTo(x, y + len).lineWidth(1.2).stroke(C.purple);
    doc.moveTo(x - 3, y + len - 4).lineTo(x, y + len).lineTo(x + 3, y + len - 4).lineWidth(1.2).stroke(C.purple);
  }

  // ═══════════════════════════════════════════════════
  // PAGE 1: COVER
  // ═══════════════════════════════════════════════════
  newPage();

  // Decorative rings
  const cx = W / 2;
  doc.circle(cx, 220, 100).lineWidth(0.5).stroke(C.purple);
  doc.circle(cx, 220, 70).lineWidth(0.3).stroke(C.purpleL);
  doc.circle(cx, 220, 40).lineWidth(0.3).stroke(C.cyan);
  doc.circle(cx, 220, 18).fill(C.purple);
  doc.circle(cx + 65, 180, 3.5).fill(C.cyan);
  doc.circle(cx - 40, 270, 3).fill(C.amber);

  doc.fontSize(40).fill(C.white).text('Zenith Quest', 0, 350, { align: 'center' });
  doc.fontSize(15).fill(C.purpleL).text('Your Personal Sky Guide', 0, 398, { align: 'center' });
  doc.moveTo(cx - 50, 430).lineTo(cx + 50, 430).lineWidth(0.8).stroke(C.purple);
  doc.fontSize(12).fill(C.t2).text('Technical Proposal — Hackathon Round 1', 0, 450, { align: 'center' });

  card(170, 500, W - 340, 70);
  doc.fontSize(9).fill(C.t3).text('PREPARED BY', 0, 512, { align: 'center' });
  doc.fontSize(13).fill(C.white).text('Zenith Quest Team', 0, 530, { align: 'center' });

  const hl = [['🛰️', '7 Live APIs'], ['🌌', '3D Sky Dome'], ['🎮', 'Gamified Missions'], ['🤖', 'AI Narrator']];
  const hlSp = CW / 4;
  hl.forEach(([ico, lbl], i) => {
    const hx = M + i * hlSp;
    doc.fontSize(22).text(ico, hx, 620, { width: hlSp, align: 'center' });
    doc.fontSize(9).fill(C.t2).text(lbl, hx, 650, { width: hlSp, align: 'center' });
  });

  doc.fontSize(9).fill(C.t3).text('June 2026', 0, H - 60, { align: 'center' });

  // ═══════════════════════════════════════════════════
  // PAGE 2: PROBLEM STATEMENT + ABOUT
  // ═══════════════════════════════════════════════════
  newPage();
  let y = 50;

  y = title('1. Problem Statement', y);

  y = para(
    `Millions of people look up at the night sky and wonder — what's that bright star? When does the ISS fly over? Is tonight good for stargazing? Yet existing astronomy apps are either too technical for casual users, or too shallow to be useful. There is no single platform that answers the simple question: "What's happening in MY sky tonight?"`,
    y, { size: 10.5, lineGap: 5, gap: 15 }
  );

  y = sub('The Core Challenges', y);

  const problems = [
    'No unified platform — Users juggle separate apps for weather, satellite tracking, planet charts, and moon phases.',
    'Overwhelming complexity — Planetarium apps show thousands of objects with no personalized guidance or priority.',
    'No "sky quality" metric — Users have no way to quickly know if tonight is worth going outside for stargazing.',
    'Zero engagement loop — Passive star charts offer no motivation for repeated use or deeper exploration.',
    'Data fragmentation — Weather, celestial positions, satellite passes, and solar activity exist across 7+ disconnected APIs.',
  ];
  problems.forEach(p => { y = bullet(p, y, C.red); });

  y += 10;
  y = title('2. Our Solution — Zenith Quest', y, C.cyan);

  y = para(
    `Zenith Quest is a real-time celestial exploration platform that transforms the night sky into a personalized, interactive experience. It combines live data from 7+ astronomical APIs, an AI-powered narrative engine, immersive 3D visualizations, and a gamified mission system into one seamless sky-watching companion.`,
    y, { size: 10.5, lineGap: 5, gap: 15 }
  );

  y = sub('What Makes It Unique', y);

  const features = [
    'Sky Score Engine — A proprietary 0–100 composite rating using 6 weighted factors (cloud cover, light pollution, planets, satellites, moon, transparency).',
    'AI Sky Narrator — GPT-4o-mini synthesizes all live data into natural-language summaries: "Tonight is excellent for stargazing! Venus and Jupiter are visible..."',
    'Interactive Satellite Tracker — Real-time Leaflet map with ISS, Starlink, and Hubble positions and orbit paths.',
    '3D Sky Dome — An immersive Three.js celestial sphere showing planets, constellations, and the moon in your local sky.',
    'Celestial Timeline — A chronological guide of every sky event from sunset to sunrise.',
    'Gamified Missions & XP — Observation, tracking, and identification missions with XP, 7 explorer ranks, badges, and daily challenges.',
    'NASA Integration — Astronomy Picture of the Day, Near Earth Objects, and Solar Flare activity.',
  ];
  features.forEach(f => { y = bullet(f, y, C.green); });

  footer();

  // ═══════════════════════════════════════════════════
  // PAGE 3: TECH STACK + APIs
  // ═══════════════════════════════════════════════════
  newPage();
  y = 50;

  y = title('3. Technology Stack', y);

  const stacks = [
    { cat: 'Frontend Framework', items: ['Next.js 16 (App Router, SSR, Turbopack)', 'React 19 (Server Components, Suspense)', 'TypeScript 5 (20+ type interfaces)'], color: C.purple },
    { cat: 'Visualization', items: ['Three.js + React Three Fiber — 3D sky dome', 'Leaflet + React-Leaflet — satellite tracking map', 'Recharts — analytics dashboards'], color: C.cyan },
    { cat: 'Styling & Animation', items: ['Tailwind CSS v4 — utility-first dark theme', 'Framer Motion — page transitions & micro-animations'], color: C.pink },
    { cat: 'State & Data', items: ['Zustand — client state (location, sky, user, missions)', 'SWR — data fetching with caching & revalidation'], color: C.amber },
    { cat: 'Backend & Auth', items: ['Clerk — OAuth authentication (Google, GitHub)', 'MongoDB + Mongoose — user data & observation history', 'Next.js API Routes — 10 server endpoints'], color: C.green },
  ];

  stacks.forEach(s => {
    doc.fontSize(11).fill(s.color).text(`▸ ${s.cat}`, M + 5, y);
    y += 16;
    s.items.forEach(item => {
      doc.circle(M + 20, y + 4.5, 2).fill(s.color);
      doc.fontSize(9).fill(C.t1).text(item, M + 30, y, { width: CW - 40 });
      y += 15;
    });
    y += 6;
  });

  y += 5;
  y = title('4. APIs & Data Sources', y);

  const apis = [
    { name: 'Open-Meteo', type: 'Weather', color: C.cyan, desc: 'Cloud cover, visibility, temperature, wind, humidity, hourly forecast, sunrise/sunset. Free, no auth. Refresh: 15 min.' },
    { name: 'N2YO', type: 'Satellites', color: C.amber, desc: 'Real-time ISS/Starlink/Hubble positions, visual pass predictions, satellites-above-observer. API Key. Refresh: 1 sec.' },
    { name: 'AstronomyAPI', type: 'Celestial', color: C.purple, desc: 'Planet positions (altitude, azimuth, magnitude, constellation), moon phase & illumination. Basic Auth. Refresh: 1 hr.' },
    { name: 'NASA APIs', type: 'Space Data', color: C.red, desc: 'Astronomy Picture of the Day (APOD), Near Earth Objects (NeoWs), Solar Flares (DONKI). API Key. Refresh: 1 hr.' },
    { name: 'OpenAI', type: 'AI', color: C.pink, desc: 'GPT-4o-mini generates natural-language sky narratives. Falls back to deterministic template engine. Bearer token.' },
  ];

  apis.forEach(api => {
    if (y > 720) { newPage(); y = 50; }
    const cardH = 44;
    card(M, y, CW, cardH);
    badge(M + 8, y + 5, api.type, api.color);
    doc.fontSize(10).fill(C.white).text(api.name, M + 8 + doc.widthOfString(api.type) + 28, y + 5);
    doc.fontSize(8).fill(C.t2).text(api.desc, M + 10, y + 24, { width: CW - 20, lineGap: 2 });
    y += cardH + 8;
  });

  footer();

  // ═══════════════════════════════════════════════════
  // PAGE 4: DIAGRAM 1 — SYSTEM ARCHITECTURE
  // ═══════════════════════════════════════════════════
  newPage();
  y = 50;

  y = title('5. System Architecture Diagram', y);

  // ── Layer 1: Client ──
  doc.fontSize(9).fill(C.purple).text('CLIENT LAYER', M + 5, y);
  y += 14;
  card(M, y, CW, 56);
  const cl = ['React 19 UI', 'Three.js\nSky Dome', 'Leaflet\nSat Map', 'Framer Motion\nAnimations', 'Zustand\nState'];
  const clW = (CW - 60) / 5;
  cl.forEach((c, i) => {
    box(M + 10 + i * (clW + 10), y + 8, clW, 38, c, C.purple);
  });
  y += 66;
  arrowD(W / 2, y, 18); y += 26;

  // ── Layer 2: Next.js ──
  doc.fontSize(9).fill(C.cyan).text('NEXT.JS 16 APP ROUTER', M + 5, y);
  y += 14;
  card(M, y, CW, 52);
  const pages = ['/ (Landing)', '/dashboard', '/satellites', '/sky-dome', '/missions', '/timeline', '/analytics', '/profile'];
  pages.forEach((p, i) => {
    const px = M + 10 + (i % 4) * (CW / 4);
    const py = y + 8 + Math.floor(i / 4) * 22;
    doc.roundedRect(px, py, CW / 4 - 15, 18, 3).fill(C.cardAlt);
    doc.fontSize(7.5).fill(C.t2).text(p, px + 6, py + 4);
  });
  y += 62;
  arrowD(W / 2, y, 18); y += 26;

  // ── Layer 3: API Routes ──
  doc.fontSize(9).fill(C.green).text('API LAYER (10 Route Handlers)', M + 5, y);
  y += 14;
  card(M, y, CW, 52);
  const routes = ['/api/sky-score', '/api/satellites', '/api/astronomy', '/api/nasa', '/api/ai-summary', '/api/missions', '/api/timeline', '/api/profile', '/api/achievements', '/api/location'];
  routes.forEach((r, i) => {
    const rx = M + 8 + (i % 5) * (CW / 5);
    const ry = y + 8 + Math.floor(i / 5) * 22;
    doc.roundedRect(rx, ry, CW / 5 - 12, 18, 3).lineWidth(0.5).stroke(C.green);
    doc.fontSize(6.5).fill(C.green).text(r, rx + 5, ry + 4);
  });
  y += 62;
  arrowD(W / 2, y, 18); y += 26;

  // ── Layer 4: Services ──
  doc.fontSize(9).fill(C.amber).text('SERVICE LAYER (Business Logic)', M + 5, y);
  y += 14;
  card(M, y, CW, 52);
  const svcs = ['skyScoreEngine', 'weatherService', 'satelliteService', 'astronomyService', 'nasaService', 'aiSummaryGen', 'timelineGen', 'missionGen'];
  svcs.forEach((s, i) => {
    const sx = M + 8 + (i % 4) * (CW / 4);
    const sy = y + 8 + Math.floor(i / 4) * 22;
    doc.fontSize(7.5).fill(C.amber).text(s, sx + 5, sy + 4);
  });
  y += 62;
  arrowD(W / 2, y, 18); y += 26;

  // ── Layer 5: External ──
  doc.fontSize(9).fill(C.red).text('EXTERNAL DATA SOURCES', M + 5, y);
  y += 14;
  card(M, y, CW, 38);
  const ext = [['Open-Meteo', C.cyan], ['N2YO', C.amber], ['AstronomyAPI', C.purple], ['NASA', C.red], ['OpenAI', C.pink], ['Clerk', C.purpleL], ['MongoDB', C.green]];
  ext.forEach(([name, color], i) => {
    const ex = M + 8 + i * (CW / 7);
    doc.roundedRect(ex, y + 8, CW / 7 - 8, 22, 4).lineWidth(0.5).stroke(color);
    doc.fontSize(7).fill(color).text(name, ex + 3, y + 14, { width: CW / 7 - 14, align: 'center' });
  });

  footer();

  // ═══════════════════════════════════════════════════
  // PAGE 5: DIAGRAM 2 — USER FLOW DIAGRAMS
  // ═══════════════════════════════════════════════════
  newPage();
  y = 50;

  y = title('6. User Flow Diagrams', y);

  function flowRow(steps, startY) {
    const bW = 88, bH = 44;
    const spacing = (CW - bW * steps.length) / (steps.length - 1);
    steps.forEach((s, i) => {
      const fx = M + i * (bW + spacing);
      doc.roundedRect(fx, startY, bW, bH, 5).fill(s.color + '20');
      doc.roundedRect(fx, startY, bW, bH, 5).lineWidth(0.5).stroke(s.color);
      doc.fontSize(8.5).fill(C.white).text(s.label, fx + 4, startY + 7, { width: bW - 8, align: 'center' });
      doc.fontSize(6.5).fill(C.t3).text(s.sub, fx + 4, startY + 22, { width: bW - 8, align: 'center' });
      if (i < steps.length - 1) {
        arrowR(fx + bW + 2, startY + bH / 2, spacing - 4);
      }
    });
    return startY + bH + 8;
  }

  // Flow 1
  y = sub('Flow 1: First-Time User Onboarding', y);
  y = flowRow([
    { label: 'Landing Page', sub: 'Hero + 3D Earth', color: C.purple },
    { label: 'Sign Up', sub: 'Clerk OAuth', color: C.purpleL },
    { label: 'Grant Location', sub: 'Geolocation API', color: C.cyan },
    { label: 'Dashboard', sub: 'Sky Score loads', color: C.green },
    { label: 'First Mission', sub: '"Observe Venus"', color: C.amber },
  ], y);
  y += 12;

  // Flow 2
  y = sub('Flow 2: Core Sky Exploration Loop', y);
  y = flowRow([
    { label: 'Open App', sub: 'Auto-detect loc', color: C.purple },
    { label: 'Sky Score', sub: '0-100 rating', color: C.cyan },
    { label: 'AI Narrator', sub: 'Sky summary', color: C.pink },
    { label: 'Timeline', sub: 'Tonight\'s events', color: C.amber },
    { label: 'Track Sats', sub: 'ISS on map', color: C.green },
  ], y);
  y += 12;

  // Flow 3
  y = sub('Flow 3: Gamification Loop', y);
  y = flowRow([
    { label: 'Browse Missions', sub: 'By type/difficulty', color: C.purple },
    { label: 'Accept Mission', sub: 'Status → active', color: C.cyan },
    { label: 'Go Stargazing', sub: 'Follow guide', color: C.amber },
    { label: 'Complete', sub: 'Progress 100%', color: C.green },
    { label: 'Earn XP', sub: 'Level + Badge', color: C.pink },
  ], y);
  y += 18;

  // Flow 4: Data Pipeline (vertical)
  y = sub('Flow 4: Real-Time Data Pipeline', y);

  const pipe = [
    { label: 'User opens app → Browser Geolocation → (lat, lng)', color: C.purple },
    { label: 'Parallel API calls: Open-Meteo + N2YO + AstronomyAPI + NASA', color: C.cyan },
    { label: 'Sky Score Engine computes 6 weighted factors → 0-100', color: C.green },
    { label: 'AI Summary Generator → natural-language narrative', color: C.pink },
    { label: 'Timeline Generator → sunset-to-sunrise event list', color: C.amber },
    { label: 'Mission Generator → contextual missions from live data', color: C.purpleL },
    { label: 'Zustand caches → SWR revalidates → UI renders', color: C.white },
  ];

  pipe.forEach((p, i) => {
    const py = y + i * 28;
    doc.circle(M + 15, py + 5, 5).fill(p.color);
    doc.fontSize(7).fill(C.bg).text(`${i + 1}`, M + 12.5, py + 2);
    doc.fontSize(9).fill(C.t1).text(p.label, M + 28, py, { width: CW - 40 });
    if (i < pipe.length - 1) {
      doc.moveTo(M + 15, py + 12).lineTo(M + 15, py + 24).lineWidth(0.5).stroke(C.border);
    }
  });

  footer();

  // ═══════════════════════════════════════════════════
  // PAGE 6: DIAGRAM 3 — WIREFRAMES (Dashboard + Satellite Map)
  // ═══════════════════════════════════════════════════
  newPage();
  y = 50;

  y = title('7. Low-Fidelity Wireframes', y);

  // ── Wireframe 1: Dashboard ──
  y = sub('Dashboard — Main View', y);

  const wfH = 230;
  doc.roundedRect(M, y, CW, wfH, 6).lineWidth(0.8).stroke(C.border);

  // Sidebar
  doc.rect(M + 1, y + 1, 55, wfH - 2).fill(C.card);
  const sideItems = ['🏠', '🛰️', '🌌', '🎯', '📊', '⏰', '👤'];
  sideItems.forEach((s, i) => {
    doc.fontSize(i === 0 ? 11 : 10).fill(i === 0 ? C.purple : C.t3).text(s, M + 5, y + 18 + i * 28, { width: 45, align: 'center' });
  });

  // Content
  const cX = M + 62, cW2 = CW - 67;

  // Header
  doc.rect(cX, y, cW2, 25).fill(C.card);
  doc.fontSize(8).fill(C.t3).text('Dashboard    📍 Location · Date', cX + 10, y + 8);

  // Sky Score area
  const gW = cW2 * 0.33;
  doc.roundedRect(cX + 5, y + 32, gW, wfH - 42, 4).lineWidth(0.5).stroke(C.border);
  doc.circle(cX + 5 + gW / 2, y + 82, 35).lineWidth(1).stroke(C.purple);
  doc.fontSize(18).fill(C.purple).text('82', cX + gW / 2 - 8, y + 72);
  doc.fontSize(7).fill(C.t3).text('SKY SCORE', cX + 5, y + 122, { width: gW, align: 'center' });
  doc.fontSize(7).fill(C.green).text('Excellent', cX + 5, y + 133, { width: gW, align: 'center' });
  // bars
  ['Cloud Cover', 'Light Poll.', 'Planets', 'Satellites', 'Moon'].forEach((l, i) => {
    const by = y + 152 + i * 13;
    doc.fontSize(5).fill(C.t3).text(l, cX + 10, by);
    doc.rect(cX + 52, by + 1, gW - 60, 5).fill(C.bg);
    doc.rect(cX + 52, by + 1, (gW - 60) * (0.5 + Math.random() * 0.45), 5).fill(C.purple);
  });

  // Right cards
  const rX = cX + gW + 10, rW = (cW2 - gW - 20) / 2, rH = 90;

  // Weather
  doc.roundedRect(rX, y + 32, rW, rH, 4).lineWidth(0.5).stroke(C.border);
  doc.fontSize(6).fill(C.t3).text('🌤️ WEATHER', rX + 6, y + 40);
  doc.fontSize(14).fill(C.white).text('22°C', rX + 6, y + 55);
  doc.fontSize(7).fill(C.t2).text('Clear sky\nClouds: 15%\nWind: 8 km/h', rX + 6, y + 76);

  // Moon
  doc.roundedRect(rX + rW + 6, y + 32, rW, rH, 4).lineWidth(0.5).stroke(C.border);
  doc.fontSize(6).fill(C.t3).text('🌙 MOON PHASE', rX + rW + 12, y + 40);
  doc.circle(rX + rW + 6 + rW / 2, y + 75, 14).lineWidth(0.5).stroke(C.amber);
  doc.fontSize(7).fill(C.t2).text('Waxing Crescent\n32% illuminated', rX + rW + 10, y + 95, { width: rW - 8, align: 'center' });

  // Planets
  doc.roundedRect(rX, y + rH + 40, rW, rH, 4).lineWidth(0.5).stroke(C.border);
  doc.fontSize(6).fill(C.t3).text('🪐 PLANETS', rX + 6, y + rH + 48);
  doc.fontSize(7).fill(C.t2).text('♀ Venus  -4.2\n♃ Jupiter -2.5\n♄ Saturn  0.8', rX + 8, y + rH + 62);

  // Satellites
  doc.roundedRect(rX + rW + 6, y + rH + 40, rW, rH, 4).lineWidth(0.5).stroke(C.border);
  doc.fontSize(6).fill(C.t3).text('🛰️ SATELLITES', rX + rW + 12, y + rH + 48);
  doc.fontSize(7).fill(C.t2).text('🚀 ISS 9:42 PM\n🛰️ Starlink 10:15\n🛰️ Hubble 11:03', rX + rW + 10, y + rH + 62);

  y += wfH + 20;

  // ── Wireframe 2: Satellite Map ──
  y = sub('Satellite Tracker — Map View', y);

  const mfH = 190;
  doc.roundedRect(M, y, CW, mfH, 6).lineWidth(0.8).stroke(C.border);

  // Sidebar
  doc.rect(M + 1, y + 1, 55, mfH - 2).fill(C.card);
  doc.fontSize(7).fill(C.purple).text('🛰️ Tracker', M + 5, y + 15, { width: 50, align: 'center' });
  doc.fontSize(6).fill(C.t3).text('ISS ●\nStarlink ●\nHubble ●\nWeather ●', M + 8, y + 40);

  // Map
  const mX = M + 58, mW = CW - 60;
  doc.rect(mX, y, mW, mfH).fill('#080E1F');

  // Grid
  for (let gx = mX + 30; gx < mX + mW; gx += 45) doc.moveTo(gx, y).lineTo(gx, y + mfH).lineWidth(0.15).stroke(C.border);
  for (let gy = y + 20; gy < y + mfH; gy += 30) doc.moveTo(mX, gy).lineTo(mX + mW, gy).lineWidth(0.15).stroke(C.border);

  // ISS with orbit
  doc.save();
  doc.moveTo(mX + 60, y + 100).bezierCurveTo(mX + 150, y + 30, mX + 250, y + 30, mX + 350, y + 90).lineWidth(0.8).dash(4, { space: 3 }).stroke(C.red);
  doc.undash();
  doc.restore();
  doc.circle(mX + 200, y + 55, 6).fill(C.red);
  doc.fontSize(7).fill(C.white).text('ISS', mX + 210, y + 51);

  doc.circle(mX + 300, y + 100, 4).fill(C.cyan);
  doc.fontSize(6).fill(C.white).text('Starlink', mX + 308, y + 97);

  doc.circle(mX + 130, y + 40, 4).fill(C.amber);
  doc.fontSize(6).fill(C.white).text('HST', mX + 138, y + 37);

  doc.fontSize(6).fill(C.t3).text('Real-time positions · Orbit paths · Click for pass details', mX + 10, y + mfH - 15);

  footer();

  // ═══════════════════════════════════════════════════
  // PAGE 7: DIAGRAM 4 — SKY SCORE ENGINE + DIAGRAM 5 — SKY DOME WIREFRAME
  // ═══════════════════════════════════════════════════
  newPage();
  y = 50;

  y = title('8. Sky Score Engine — Algorithm Diagram', y);

  // Input boxes
  doc.fontSize(9).fill(C.t3).text('INPUT DATA', M + 5, y);
  y += 14;
  const inputs = [
    ['Cloud Cover %', 'Open-Meteo', C.cyan],
    ['Bortle Scale', 'Light Poll. DB', C.purpleL],
    ['Visible Planets', 'AstronomyAPI', C.purple],
    ['Satellite Count', 'N2YO', C.amber],
    ['Moon Illumination', 'AstronomyAPI', C.pink],
    ['Visibility (km)', 'Open-Meteo', C.cyan],
  ];
  const inW = (CW - 20) / 3;
  inputs.forEach((inp, i) => {
    const ix = M + 5 + (i % 3) * (inW + 5);
    const iy = y + Math.floor(i / 3) * 35;
    doc.roundedRect(ix, iy, inW, 28, 4).lineWidth(0.5).stroke(inp[2]);
    doc.fontSize(8).fill(C.white).text(inp[0], ix + 6, iy + 4);
    doc.fontSize(6).fill(C.t3).text(`Source: ${inp[1]}`, ix + 6, iy + 16);
  });
  y += 80;

  // Arrow down to engine
  arrowD(W / 2, y, 20); y += 28;

  // Engine box
  card(M + 40, y, CW - 80, 90);
  doc.fontSize(12).fill(C.purple).text('Sky Score Engine', M + 40, y + 8, { width: CW - 80, align: 'center' });
  doc.moveTo(M + 80, y + 26).lineTo(W - M - 80, y + 26).lineWidth(0.3).stroke(C.border);

  const weights = [
    ['Cloud Cover', '30%'], ['Light Pollution', '25%'], ['Visible Planets', '15%'],
    ['Satellites', '10%'], ['Moon Brightness', '10%'], ['Transparency', '10%'],
  ];
  weights.forEach((w, i) => {
    const wx = M + 55 + (i % 3) * ((CW - 110) / 3);
    const wy = y + 34 + Math.floor(i / 3) * 26;
    doc.fontSize(8).fill(C.t2).text(w[0], wx, wy);
    doc.fontSize(8).fill(C.purple).text(w[1], wx + 95, wy);
  });

  y += 100;
  arrowD(W / 2, y, 20); y += 28;

  // Output
  const outBoxes = [
    ['Score 0-100', C.purple],
    ['Rating\n(Excellent/Good/\nAverage/Poor)', C.green],
    ['Recommendation\nText', C.cyan],
    ['Best Viewing\nTime', C.amber],
  ];
  const obW = (CW - 30) / 4;
  outBoxes.forEach((o, i) => {
    const ox = M + 5 + i * (obW + 8);
    box(ox, y, obW, 48, '', o[1], o[1] + '18');
    doc.fontSize(7.5).fill(C.t1).text(o[0], ox + 5, y + 8, { width: obW - 10, align: 'center' });
  });

  y += 70;

  // ── Diagram 5: 3D Sky Dome Wireframe ──
  y = sub('3D Sky Dome — Wireframe', y);

  const domeH = 200;
  doc.roundedRect(M, y, CW, domeH, 6).lineWidth(0.8).stroke(C.border);

  // Sidebar
  doc.rect(M + 1, y + 1, 55, domeH - 2).fill(C.card);
  doc.fontSize(7).fill(C.purple).text('🌌 Sky Dome', M + 3, y + 15, { width: 50, align: 'center' });
  doc.fontSize(6).fill(C.t3).text('Planets ✓\nStars ✓\nConst. ✓\nGrid ✓', M + 8, y + 40);

  // Dome
  const dCx = M + 55 + (CW - 60) / 2;
  const dCy = y + domeH / 2 + 10;

  // Hemisphere arc
  doc.save();
  doc.moveTo(dCx - 150, dCy + 25)
    .quadraticCurveTo(dCx, dCy - 100, dCx + 150, dCy + 25)
    .lineWidth(0.8).stroke(C.purple);
  doc.restore();

  // Horizon
  doc.moveTo(dCx - 150, dCy + 25).lineTo(dCx + 150, dCy + 25).lineWidth(0.3).stroke(C.border);

  // Meridian arcs
  for (let a = -100; a <= 100; a += 60) {
    doc.save();
    doc.moveTo(dCx + a * 0.9, dCy + 25)
      .quadraticCurveTo(dCx + a * 0.4, dCy - 40, dCx + a * 0.9, dCy + 25)
      .lineWidth(0.15).stroke(C.border);
    doc.restore();
  }

  // Objects
  doc.circle(dCx - 70, dCy - 30, 5).fill(C.amber);
  doc.fontSize(6).fill(C.white).text('Venus', dCx - 85, dCy - 43);

  doc.circle(dCx + 40, dCy - 15, 4).fill('#E53E3E');
  doc.fontSize(6).fill(C.white).text('Mars', dCx + 30, dCy - 28);

  doc.circle(dCx + 100, dCy + 2, 5).fill(C.amber);
  doc.fontSize(6).fill(C.white).text('Jupiter', dCx + 85, dCy - 12);

  doc.circle(dCx - 110, dCy + 5, 10).lineWidth(0.5).stroke(C.amber);
  doc.fontSize(6).fill(C.white).text('Moon', dCx - 120, dCy + 20);

  // Constellation
  const cs = [[dCx - 20, dCy - 55], [dCx - 8, dCy - 65], [dCx + 8, dCy - 58], [dCx + 5, dCy - 48]];
  cs.forEach(([cx2, cy]) => doc.circle(cx2, cy, 1.5).fill(C.white));
  doc.moveTo(cs[0][0], cs[0][1]).lineTo(cs[1][0], cs[1][1]).lineTo(cs[2][0], cs[2][1]).lineTo(cs[3][0], cs[3][1]).lineWidth(0.3).stroke(C.t3);

  // Labels
  doc.fontSize(6).fill(C.t3).text('N', dCx - 2, dCy + 30);
  doc.fontSize(6).fill(C.t3).text('E', dCx + 142, dCy + 18);
  doc.fontSize(6).fill(C.t3).text('W', dCx - 152, dCy + 18);
  doc.fontSize(7).fill(C.t3).text('Interactive Three.js sphere · Rotate · Zoom · Click objects for details', dCx - 120, dCy + 48);

  footer();

  // ═══════════════════════════════════════════════════
  // PAGE 8: IMPLEMENTATION STRATEGY
  // ═══════════════════════════════════════════════════
  newPage();
  y = 50;

  y = title('9. Implementation Strategy', y);

  const phases = [
    { name: 'Phase 1 — Foundation', days: 'Days 1–2', color: C.purple, tasks: [
      'Next.js 16 project setup with TypeScript, Tailwind CSS v4, Turbopack',
      'Clerk authentication + MongoDB Atlas database schemas',
      'Dark-mode design system: glassmorphism cards, gradients, cosmic palette',
      'Define 20+ TypeScript interfaces for all data models',
    ]},
    { name: 'Phase 2 — Data Engine', days: 'Days 3–4', color: C.cyan, tasks: [
      'Integrate all 5 APIs: Open-Meteo, N2YO, AstronomyAPI, NASA, OpenAI',
      'Build Sky Score Engine with 6-factor weighted algorithm',
      'Create comprehensive mock data for full demo-mode operation',
      'Build AI Summary Generator with deterministic fallback',
    ]},
    { name: 'Phase 3 — Visualizations', days: 'Days 5–7', color: C.green, tasks: [
      'Dashboard: SkyScoreGauge, WeatherCard, MoonPhaseCard, PlanetCard, SatelliteCard',
      'Satellite Tracker: Leaflet map with ISS/Starlink markers + orbit paths',
      '3D Sky Dome: Three.js hemisphere with planets and constellations',
      'Celestial Timeline + Landing page with 3D Earth hero',
    ]},
    { name: 'Phase 4 — Gamification', days: 'Days 8–9', color: C.amber, tasks: [
      'Mission Generator: contextual observation/tracking/identification missions',
      'XP system with 7 explorer ranks (Stargazer → Universe Sage)',
      'Badge system: 5 rarity tiers × 6 categories + daily challenges',
    ]},
    { name: 'Phase 5 — Polish & Deploy', days: 'Days 10–12', color: C.pink, tasks: [
      'Analytics dashboard with Recharts, responsive testing',
      'Performance: ISR caching, dynamic imports, bundle optimization',
      'SEO, accessibility review, Vercel deployment, demo recording',
    ]},
  ];

  phases.forEach(ph => {
    if (y > 700) { newPage(); y = 50; }
    badge(M + 5, y, ph.days, ph.color);
    doc.fontSize(11).fill(C.white).text(ph.name, M + doc.widthOfString(ph.days) + 30, y);
    y += 22;
    ph.tasks.forEach(t => {
      doc.circle(M + 20, y + 4, 3).fill(ph.color);
      doc.fontSize(7.5).fill(C.bg).text('✓', M + 17.7, y + 1);
      doc.fontSize(9).fill(C.t2).text(t, M + 30, y, { width: CW - 40 });
      y += doc.heightOfString(t, { width: CW - 40 }) + 5;
    });
    y += 10;
  });

  y += 15;
  if (y > 600) { newPage(); y = 50; }

  y = title('10. Conclusion', y, C.cyan);

  y = para(
    `Zenith Quest addresses a clear gap in the astronomy app market by combining real-time data from 7 APIs, an AI-powered narrative engine, immersive 3D visualizations, and gamification into a single, beautiful platform. The modular architecture ensures scalability, the mock data system guarantees a flawless demo experience, and the dark-first design creates an immersive stargazing companion.`,
    y, { size: 10.5, lineGap: 5, gap: 15 }
  );

  y = para(
    `With a clear implementation timeline, proven technology stack, and strong feasibility profile, Zenith Quest is ready to transform how people experience the night sky.`,
    y, { size: 10.5, lineGap: 5, color: C.purpleL }
  );

  footer();

  // ── Finalize ──
  doc.end();
  console.log(`\n✅ Proposal PDF generated!`);
  console.log(`📄 ${path.join(__dirname, 'Zenith_Quest_Proposal.pdf')}`);
  console.log(`📊 Pages: ${pageNum}`);
}

generate();
