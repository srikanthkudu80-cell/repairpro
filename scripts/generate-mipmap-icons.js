/**
 * Generates Android mipmap launcher icons at all required densities
 * from assets/images/icon.png and assets/images/adaptive-icon.png
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const iconSrc = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
const adaptiveSrc = path.join(__dirname, '..', 'assets', 'images', 'adaptive-icon.png');

// ic_launcher sizes (full icon with background)
const launcherSizes = {
  'mipmap-mdpi':    48,
  'mipmap-hdpi':    72,
  'mipmap-xhdpi':   96,
  'mipmap-xxhdpi':  144,
  'mipmap-xxxhdpi': 192,
};

// ic_launcher_round sizes (same as launcher, just circular crop applied at OS level)
// ic_launcher_foreground sizes (adaptive icon foreground — larger canvas)
const foregroundSizes = {
  'mipmap-mdpi':    108,
  'mipmap-hdpi':    162,
  'mipmap-xhdpi':   216,
  'mipmap-xxhdpi':  324,
  'mipmap-xxxhdpi': 432,
};

async function run() {
  // Generate ic_launcher and ic_launcher_round from icon.png (full icon)
  for (const [dir, size] of Object.entries(launcherSizes)) {
    const outDir = path.join(resDir, dir);
    fs.mkdirSync(outDir, { recursive: true });

    await sharp(iconSrc)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));

    await sharp(iconSrc)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));

    console.log(`✓ ${dir}: ic_launcher.png + ic_launcher_round.png (${size}×${size})`);
  }

  // Generate ic_launcher_foreground from adaptive-icon.png
  for (const [dir, size] of Object.entries(foregroundSizes)) {
    const outDir = path.join(resDir, dir);
    fs.mkdirSync(outDir, { recursive: true });

    await sharp(adaptiveSrc)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));

    console.log(`✓ ${dir}: ic_launcher_foreground.png (${size}×${size})`);
  }

  console.log('\nAll mipmap icons generated successfully!');
}

run().catch((err) => { console.error(err); process.exit(1); });
