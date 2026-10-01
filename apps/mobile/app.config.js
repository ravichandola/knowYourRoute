const path = require('path');
const fs = require('fs');

/** Load EXPO_PUBLIC_* vars from .env files (monorepo root + local). */
function loadEnvFiles() {
  const candidates = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../../.env'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      if (!key.startsWith('EXPO_PUBLIC_')) continue;

      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFiles();

/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...require('./app.json').expo,
  ...config,
});
