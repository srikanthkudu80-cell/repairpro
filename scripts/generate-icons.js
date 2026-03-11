/**
 * RepairPro icon generator
 * Generates icon.png (1024x1024), adaptive-icon.png (1024x1024), splash.png (2048x2048)
 * Run: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// ─── SVG definitions ───────────────────────────────────────────────────────────

// Main app icon: teal rounded-square background + white wrench + "RP" lettermark
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <!-- Background -->
  <rect width="1024" height="1024" rx="224" ry="224" fill="#008080"/>

  <!-- Subtle radial highlight -->
  <radialGradient id="g" cx="38%" cy="32%" r="62%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.06"/>
  </radialGradient>
  <rect width="1024" height="1024" rx="224" ry="224" fill="url(#g)"/>

  <!-- Wrench icon (centered, white) -->
  <!-- Wrench handle -->
  <g transform="translate(512,512)" fill="white">
    <!-- Wrench shape -->
    <path d="
      M 60,-220
      A 140,140 0 0,1 -60,-220
      A 140,140 0 0,0 -140,-100
      L -140,-60
      A 140,140 0 0,0 -60,60
      L -42,42
      L -200,200
      A 44,44 0 0,0 -200,262
      L -62,262
      A 44,44 0 0,0 0,200
      L 42,42
      L 60,60
      A 140,140 0 0,0 140,-60
      L 140,-100
      A 140,140 0 0,0 60,-220
      Z
    " opacity="0"/>

    <!-- Cleaner wrench using standard paths -->
    <!-- Wrench head (open-end) top-right -->
    <path d="
      M 155,-310
      C 230,-310 290,-250 290,-175
      C 290,-125 265,-82 225,-58
      L 225,-30
      L 270,15
      L -140,425
      C -165,450 -165,490 -140,515
      C -115,540 -75,540 -50,515
      L 360,105
      L 405,150
      L 432,150
      C 458,-112 238,-310 155,-310
      Z
    " opacity="0"/>
  </g>

  <!-- Use a clean, hand-drawn-style wrench -->
  <g transform="translate(512,512) rotate(-38)" fill="white" stroke="none">
    <!-- Wrench handle (long rod) -->
    <rect x="-46" y="-40" width="92" height="380" rx="46"/>

    <!-- Wrench jaw top -->
    <path d="
      M -46,-40
      L 46,-40
      L 46,-160
      C 46,-230 -20,-260 -70,-220
      L -70,-120
      L -46,-120
      Z
    " opacity="0"/>
  </g>

  <!-- Final clean wrench rendered directly -->
  <g transform="translate(200,170)">
    <!-- Wrench body -->
    <path
      d="M 430 100
         C 490 40 520 -10 510 -70
         C 498 -140 430 -180 360 -165
         C 320 -156 290 -130 280 -100
         L 230 -50
         L 90 -50
         L 40 -100
         C 30 -130 0 -156 -40 -165
         C -110 -180 -178 -140 -190 -70
         C -200 -10 -170 40 -110 100
         C -70 140 -20 162 30 162
         L 30 100
         L -40 100
         C -80 100 -112 68 -112 28
         C -112 -12 -80 -44 -40 -44
         L 40 -44
         L 40 100
         L 200 100
         L 200 -44
         L 270 -44
         C 310 -44 342 -12 342 28
         C 342 68 310 100 270 100
         L 200 100
         L 200 162
         C 250 162 300 140 430 100
         Z"
      fill="white"
      opacity="0"
    />
  </g>

  <!-- Clean professional wrench icon using paths only -->
  <g transform="translate(512 512)">
    <!-- Wrench handle -->
    <rect x="-52" y="-30" width="104" height="340" rx="52" fill="white" transform="rotate(-40)"/>

    <!-- Wrench top jaw left -->
    <rect x="-52" y="-295" width="44" height="130" rx="22" fill="white" transform="rotate(-40)"/>
    <!-- Wrench top jaw right -->
    <rect x="8" y="-295" width="44" height="130" rx="22" fill="white" transform="rotate(-40)"/>
    <!-- Wrench top cross -->
    <rect x="-52" y="-295" width="104" height="44" rx="22" fill="white" transform="rotate(-40)"/>
    <!-- Wrench mid -->
    <rect x="-52" y="-175" width="104" height="44" rx="8" fill="white" transform="rotate(-40)"/>
  </g>

  <!-- "RP" monogram — bottom right area as secondary brand mark -->
  <text
    x="512" y="820"
    font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
    font-size="0"
    font-weight="900"
    fill="white"
    text-anchor="middle"
    letter-spacing="-4"
    opacity="0.8">RP</text>
</svg>`;

// Better approach: clean SVG wrench built properly
const cleanIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#00a0a0"/>
      <stop offset="100%" stop-color="#006060"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="1024" height="1024" rx="220" ry="220" fill="url(#bg)"/>

  <!-- Wrench icon, centered, white, slightly rotated -->
  <g transform="translate(512,480) rotate(-40)" filter="url(#shadow)">
    <!-- Jaw opening gap -->
    <!-- Left jaw leg -->
    <rect x="-130" y="-340" width="88" height="174" rx="20" fill="white"/>
    <!-- Right jaw leg -->
    <rect x="42"   y="-340" width="88" height="174" rx="20" fill="white"/>
    <!-- Jaw back (connects both legs) -->
    <rect x="-130" y="-340" width="260" height="80"  rx="20" fill="white"/>
    <!-- Neck connecting jaw to handle -->
    <rect x="-60"  y="-166" width="120" height="60"  rx="10" fill="white"/>
    <!-- Handle (long rod) -->
    <rect x="-55"  y="-110" width="110" height="430" rx="55" fill="white"/>
  </g>
</svg>`;

// Splash screen SVG — full teal background with centered logo
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="2048" height="2048">
  <defs>
    <radialGradient id="sbg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#00a0a0"/>
      <stop offset="100%" stop-color="#005555"/>
    </radialGradient>
  </defs>
  <rect width="2048" height="2048" fill="url(#sbg)"/>

  <!-- Wrench, larger, centered -->
  <g transform="translate(1024,940) rotate(-40)">
    <rect x="-150" y="-390" width="100" height="200" rx="22" fill="white"/>
    <rect x="50"   y="-390" width="100" height="200" rx="22" fill="white"/>
    <rect x="-150" y="-390" width="300" height="92"  rx="22" fill="white"/>
    <rect x="-70"  y="-190" width="140" height="70"  rx="12" fill="white"/>
    <rect x="-64"  y="-125" width="128" height="500" rx="64" fill="white"/>
  </g>

  <!-- App name below icon -->
  <text
    x="1024" y="1310"
    font-family="'Arial Black', Arial, sans-serif"
    font-size="148"
    font-weight="900"
    fill="white"
    text-anchor="middle"
    opacity="0.95"
    letter-spacing="-2">RepairPro</text>
  <text
    x="1024" y="1430"
    font-family="Arial, sans-serif"
    font-size="68"
    fill="white"
    text-anchor="middle"
    opacity="0.6"
    letter-spacing="6">APPLIANCE REPAIR</text>
</svg>`;

// Adaptive icon foreground (transparent bg, wrench only, with safe zone padding)
const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g transform="translate(512,490) rotate(-40)">
    <rect x="-120" y="-320" width="90" height="165" rx="18" fill="white"/>
    <rect x="30"   y="-320" width="90" height="165" rx="18" fill="white"/>
    <rect x="-120" y="-320" width="240" height="76"  rx="18" fill="white"/>
    <rect x="-55"  y="-155" width="110" height="60"  rx="10" fill="white"/>
    <rect x="-52"  y="-100" width="104" height="400" rx="52" fill="white"/>
  </g>
</svg>`;

async function generate() {
  fs.mkdirSync(OUT, { recursive: true });

  const tasks = [
    {
      svg: cleanIconSvg,
      out: path.join(OUT, 'icon.png'),
      size: 1024,
      label: 'icon.png (1024×1024)',
    },
    {
      svg: adaptiveSvg,
      out: path.join(OUT, 'adaptive-icon.png'),
      size: 1024,
      label: 'adaptive-icon.png (1024×1024)',
    },
    {
      svg: splashSvg,
      out: path.join(OUT, 'splash.png'),
      size: 2048,
      label: 'splash.png (2048×2048)',
    },
    // Also overwrite logo.png with the same icon (used in notifications etc.)
    {
      svg: cleanIconSvg,
      out: path.join(OUT, 'logo.png'),
      size: 1024,
      label: 'logo.png (1024×1024)',
    },
  ];

  for (const task of tasks) {
    await sharp(Buffer.from(task.svg))
      .resize(task.size, task.size)
      .png()
      .toFile(task.out);
    console.log(`✓ ${task.label}`);
  }

  console.log('\nAll icons generated in assets/images/');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
