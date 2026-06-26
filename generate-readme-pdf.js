const PDFDocument = require("pdfkit");
const fs = require("fs");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 55, bottom: 55, left: 55, right: 55 },
  info: {
    Title: "Zenith Quest — README",
    Author: "Zenith Quest Team",
  },
});

const output = fs.createWriteStream("README_Round2.pdf");
doc.pipe(output);

// ── Color Palette ──
const C = {
  dark: "#111827",
  heading: "#1E293B",
  body: "#374151",
  muted: "#6B7280",
  accent: "#6366F1",
  accentLight: "#A5B4FC",
  link: "#4F46E5",
  tableBorder: "#E5E7EB",
  tableHeaderBg: "#EEF2FF",
  codeBg: "#F1F5F9",
  white: "#FFFFFF",
  noteBg: "#FEF9C3",
  noteBorder: "#F59E0B",
};

// ── Helpers ──
const pageW = 595.28 - 55 * 2; // usable width

function drawHr(y) {
  doc
    .moveTo(55, y)
    .lineTo(55 + pageW, y)
    .strokeColor(C.tableBorder)
    .lineWidth(0.75)
    .stroke();
}

function ensureSpace(needed) {
  if (doc.y + needed > doc.page.height - 60) doc.addPage();
}

function sectionTitle(text) {
  ensureSpace(50);
  doc.moveDown(0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(C.accent)
    .text(text, { continued: false });
  doc.moveDown(0.15);
  drawHr(doc.y);
  doc.moveDown(0.5);
}

function subHeading(text) {
  ensureSpace(35);
  doc.moveDown(0.4);
  doc
    .font("Helvetica-Bold")
    .fontSize(12.5)
    .fillColor(C.heading)
    .text(text);
  doc.moveDown(0.3);
}

function bodyText(text) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(C.body)
    .text(text, { lineGap: 3.5 });
  doc.moveDown(0.2);
}

function bullet(text, indent = 0) {
  const x = 62 + indent;
  doc.font("Helvetica").fontSize(10).fillColor(C.body);
  doc.text("•", x, doc.y, { continued: true, width: 10 });
  doc.text("  " + text, { lineGap: 3 });
  doc.moveDown(0.1);
}

function bulletBold(label, rest, indent = 0) {
  const x = 62 + indent;
  doc.font("Helvetica").fontSize(10).fillColor(C.body);
  doc.text("•  ", x, doc.y, { continued: true });
  doc.font("Helvetica-Bold").text(label, { continued: true });
  doc.font("Helvetica").text(rest, { lineGap: 3 });
  doc.moveDown(0.1);
}

function codeBlock(lines) {
  ensureSpace(lines.length * 13 + 20);
  const startY = doc.y;
  // measure
  doc.font("Courier").fontSize(8.5);
  const textH = lines.length * 13 + 14;
  doc.save();
  doc
    .roundedRect(57, startY, pageW - 4, textH, 4)
    .fill(C.codeBg);
  doc.restore();
  doc.y = startY + 7;
  lines.forEach((l) => {
    doc.font("Courier").fontSize(8.5).fillColor("#1E293B").text(l, 65, doc.y, {
      width: pageW - 24,
      lineGap: 2,
    });
    doc.y += 13;
  });
  doc.y += 5;
}

function drawTable(headers, rows, colWidths) {
  const rowH = 22;
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const startX = 57;

  ensureSpace(rowH * (rows.length + 1) + 10);

  let y = doc.y;

  // header row
  doc.save();
  doc.roundedRect(startX, y, tableW, rowH, 2).fill(C.tableHeaderBg);
  doc.restore();
  let x = startX;
  headers.forEach((h, i) => {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.heading);
    doc.text(h, x + 6, y + 6, { width: colWidths[i] - 12 });
    x += colWidths[i];
  });
  y += rowH;

  // data rows
  rows.forEach((row, ri) => {
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = doc.y;
    }
    if (ri % 2 === 1) {
      doc.save();
      doc.rect(startX, y, tableW, rowH).fill("#F9FAFB");
      doc.restore();
    }
    x = startX;
    row.forEach((cell, ci) => {
      doc.font("Helvetica").fontSize(9).fillColor(C.body);
      doc.text(cell, x + 6, y + 6, { width: colWidths[ci] - 12 });
      x += colWidths[ci];
    });
    y += rowH;
  });

  // border
  doc.save();
  doc.roundedRect(startX, doc.y, tableW, y - doc.y, 2).strokeColor(C.tableBorder).lineWidth(0.5).stroke();
  doc.restore();

  doc.y = y + 6;
}

function noteBox(text) {
  ensureSpace(50);
  const startY = doc.y;
  doc.font("Helvetica").fontSize(9.5);
  const h = doc.heightOfString(text, { width: pageW - 40 }) + 20;
  doc.save();
  doc.roundedRect(57, startY, pageW - 4, h, 4).fill(C.noteBg);
  doc.roundedRect(57, startY, 4, h, 2).fill(C.noteBorder);
  doc.restore();
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#92400E").text("Note:", 70, startY + 8, { continued: true });
  doc.font("Helvetica").fillColor("#78350F").text(" " + text, { width: pageW - 40, lineGap: 3 });
  doc.y = startY + h + 8;
}

// ═══════════════════════════════════════════════════
//   BUILD THE PDF
// ═══════════════════════════════════════════════════

// ── Title Area ──
doc.moveDown(1.5);
doc
  .font("Helvetica-Bold")
  .fontSize(28)
  .fillColor(C.accent)
  .text("Zenith Quest", { align: "center" });
doc
  .font("Helvetica")
  .fontSize(13)
  .fillColor(C.muted)
  .text("Your Personal Sky Guide", { align: "center" });
doc.moveDown(0.6);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(C.body)
  .text(
    "Zenith Quest is an immersive celestial exploration platform designed as a dark-mode-first, premium stargazing companion. It aggregates real-time data from 7+ astronomical APIs and synthesizes them into personalized, interactive sky guides — using custom orbital calculations, Three.js celestial spheres, real-time maps, and gamified challenges.",
    { align: "center", lineGap: 3.5 }
  );
doc.moveDown(0.4);
drawHr(doc.y);

// ══════════════════════════════════════════════════════
//  SECTION 1 — INSTALLATION & SETUP
// ══════════════════════════════════════════════════════
sectionTitle("Installation and Setup Instructions");

bodyText(
  "Follow these steps to configure, install, and run Zenith Quest on your local development machine."
);

subHeading("Prerequisites");
bulletBold("Node.js", " — v18.x or later recommended");
bulletBold("npm", " — or your preferred package manager (yarn, pnpm)");
bulletBold("MongoDB", " — a local running instance or a MongoDB Atlas URI");

subHeading("Step 1: Clone the Repository");
bodyText("Clone the codebase and navigate to the project root:");
codeBlock(["git clone <repository-url>", 'cd "Zenith Quest"']);

subHeading("Step 2: Install Dependencies");
bodyText("Install all required Node.js libraries:");
codeBlock(["npm install"]);

subHeading("Step 3: Configure Environment Variables");
bodyText(
  "Copy the environment template file to create your local configuration:"
);
codeBlock(["cp .env.example .env.local"]);
bodyText(
  "Open .env.local in your text editor and fill in the following keys:"
);
codeBlock([
  "# Clerk Authentication (https://clerk.com)",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key",
  "CLERK_SECRET_KEY=your_key",
  "",
  "# MongoDB Connection String",
  "MONGODB_URI=mongodb://localhost:27017/zenith-quest",
  "",
  "# NASA API Key (free tier, defaults to DEMO_KEY)",
  "NASA_API_KEY=your_key",
  "",
  "# AstronomyAPI (https://astronomyapi.com)",
  "ASTRONOMY_API_ID=your_id",
  "ASTRONOMY_API_SECRET=your_secret",
  "",
  "# N2YO Satellite Tracking (https://www.n2yo.com)",
  "N2YO_API_KEY=your_key",
  "",
  "# OpenAI API Key (optional — for AI Sky Narrator)",
  "OPENAI_API_KEY=your_key",
  "",
  "# Public Routing",
  "NEXT_PUBLIC_APP_URL=http://localhost:3000",
]);

noteBox(
  "Fully Functional Demo Mode — If you do not have active keys for N2YO, AstronomyAPI, or OpenAI, the application uses built-in mathematical astronomy calculators, keyless ISS tracking endpoints, and local deterministic narrative templates as comprehensive fallbacks."
);

subHeading("Step 4: Run MongoDB");
bodyText("If you are using a local MongoDB database, start the daemon:");
codeBlock(["mongod"]);

subHeading("Step 5: Start the Development Server");
bodyText("Launch the local environment using Next.js Turbopack:");
codeBlock(["npm run dev"]);
bodyText("Open your browser and navigate to http://localhost:3000.");

// ══════════════════════════════════════════════════════
//  SECTION 2 — FEATURES
// ══════════════════════════════════════════════════════
sectionTitle("Website Functionality and Unique Features");
bodyText(
  "Zenith Quest stands out by combining rich astronomical visualizations with context-aware gamification and real-time computation."
);

// Feature 1
subHeading("1. Proprietary Sky Score Engine");
bodyText(
  "Calculates a composite 0–100 Sky Quality Score dynamically optimized for your local coordinates. Evaluates 6 weighted factors:"
);
bulletBold("Cloud Cover (30%)", " — Powered by Open-Meteo; lower is better.", 8);
bulletBold("Light Pollution (25%)", " — Bortle Scale (1–9); lower is better.", 8);
bulletBold("Visible Planets (15%)", " — Real-time planetary visibility; more is better.", 8);
bulletBold("Satellite Activity (10%)", " — Count of satellite passes above you.", 8);
bulletBold("Moon Brightness (10%)", " — Illumination level; critical for deep sky objects.", 8);
bulletBold("Transparency (10%)", " — Atmospheric visibility in kilometers.", 8);
bodyText(
  "Outputs clear viewing recommendations (Excellent / Good / Average / Poor) and computes optimal hourly stargazing windows."
);

// Feature 2
subHeading("2. AI Sky Narrator");
bulletBold(
  "Natural-language narrative",
  " synthesized from real-time weather and celestial position data."
);
bulletBold(
  "Powered by OpenAI GPT-4o-mini",
  " for concise daily sky summaries and viewing tips."
);
bulletBold(
  "Smart deterministic fallback",
  " constructs logical narratives locally when API keys are unavailable."
);

// Feature 3
subHeading("3. Interactive 3D Sky Dome");
bulletBold(
  "Three.js + React Three Fiber",
  " — immersive celestial dome rendered in real-time."
);
bulletBold(
  "Displays constellations, stars, planets, and the Moon",
  " mapped to your exact latitude, longitude, and current local time."
);
bulletBold(
  "Full interaction",
  " — rotation, zoom, and click to inspect astronomical coordinates (RA, Dec, Altitude, Azimuth)."
);

// Feature 4
subHeading("4. Real-Time Satellite Tracker");
bulletBold(
  "Live satellite orbits",
  " visualized on a beautiful Leaflet map."
);
bulletBold(
  "Tracks ISS, Hubble, weather satellites, and Starlink",
  " constellations."
);
bulletBold(
  "Calculates visual pass schedules",
  ", maximum elevations, azimuth trajectories, and compass directions."
);

// Feature 5
subHeading("5. Gamified Missions & XP");
bulletBold(
  "3 mission types",
  " — Observation, Tracking, and Identification challenges."
);
bulletBold(
  "Progression system",
  " — XP rewards, 7 explorer ranks (Stargazer → Universe Sage), persistent observation history."
);
bulletBold(
  "Badge reward system",
  " — 5 rarity tiers across diverse observation achievements."
);

// Feature 6
subHeading("6. NASA Integration");
bulletBold(
  "Astronomy Picture of the Day (APOD)",
  " — displayed with full captions."
);
bulletBold(
  "Near-Earth Objects (NEOs)",
  " — relative velocity, miss distance, and hazardous flags."
);
bulletBold(
  "Solar Activity Monitoring",
  " — flares, geomagnetic storms, solar wind speed, and Aurora forecasts via NOAA/NASA DONKI."
);

// Feature 7
subHeading("7. Celestial Timeline");
bodyText(
  "Provides a detailed sunset-to-sunrise timeline showing planetary rise/set/transit times, twilight boundaries, and astronomical milestones."
);

// ══════════════════════════════════════════════════════
//  SECTION 3 — DEPENDENCIES
// ══════════════════════════════════════════════════════
sectionTitle("Dependencies");
bodyText(
  "Zenith Quest is built on a modern, highly optimized JavaScript/TypeScript ecosystem."
);

subHeading("Core Framework & Build Tools");
drawTable(
  ["Dependency", "Version", "Purpose"],
  [
    ["Next.js", "16", "App Router, Turbopack, SSR, Route Handlers"],
    ["React", "19", "Server Components, Suspense, Hooks"],
    ["TypeScript", "5", "Strictly-typed schemas & service interfaces"],
    ["Tailwind CSS", "v4", "Utility-first styling with CSS variables"],
    ["Framer Motion", "12", "Page transitions and micro-animations"],
  ],
  [120, 60, pageW - 180 - 4]
);

subHeading("Astronomical & Visual Tools");
drawTable(
  ["Dependency", "Purpose"],
  [
    ["Three.js", "3D rendering engine for celestial visualizations"],
    ["React Three Fiber", "React renderer for Three.js scenes"],
    ["Drei (@react-three/drei)", "Helper components for React Three Fiber"],
    ["Leaflet & React-Leaflet", "Interactive maps for satellite coordinates"],
    ["Recharts", "Interactive dashboards and observation analytics"],
  ],
  [165, pageW - 165 - 4]
);

subHeading("Backend & Data Infrastructure");
drawTable(
  ["Dependency", "Purpose"],
  [
    ["MongoDB & Mongoose", "NoSQL storage — profiles, badges, observation logs"],
    ["Clerk (@clerk/nextjs)", "Secure OAuth sign-in (Google & GitHub)"],
    ["OpenAI Node SDK", "LLM-based narrative generation"],
    ["SWR", "Data caching and revalidation for API fetchers"],
    ["Zustand", "Client-side global state management"],
    ["PDFKit", "Backend PDF generation for proposals"],
  ],
  [165, pageW - 165 - 4]
);

subHeading("External APIs");
drawTable(
  ["API", "Data Provided"],
  [
    ["Open-Meteo", "Cloud cover, visibility, humidity, wind, forecasts"],
    ["AstronomyAPI", "Planetary coordinates, moon phase, illumination"],
    ["N2YO", "Satellite passes, trajectories, overhead arrays"],
    ["NASA Web Services", "APOD, NeoWs, Solar Flare DONKI"],
    ["wheretheiss.at", "Keyless real-time ISS tracking"],
  ],
  [135, pageW - 135 - 4]
);

// ── Dev Commands ──
subHeading("Development Commands");
drawTable(
  ["Command", "Purpose"],
  [
    ["npm run dev", "Start dev server with hot module replacement"],
    ["npm run build", "Compile production-ready bundle"],
    ["npm start", "Run the built production application"],
    ["npm run lint", "Run ESLint checks"],
  ],
  [155, pageW - 155 - 4]
);

// ── Footer ──
doc.moveDown(0.6);
drawHr(doc.y);
doc.moveDown(0.4);
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor(C.muted)
  .text("This project is licensed under the MIT License.", { align: "center" });

// ── Finalize ──
doc.end();
output.on("finish", () => {
  console.log("✅ README_Round2.pdf generated successfully!");
});
