import 'dotenv/config';
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const username = process.argv[2];
if (!username) {
  console.error("❌ Usage: node live.js <username>");
  process.exit(1);
}

console.log(`📺 Connecting to LIVE of @${username}...`);

const connection = new TikTokLiveConnection(username);

// Generate a timestamp safe for filenames
const dateObj = new Date();
const timestamp = `${dateObj.getFullYear()}_${dateObj.getMonth() + 1}_${dateObj.getDate()}`
const jsonFilename = `${username}_live_${timestamp}.json`;
const HTMLFilename = `${username}_live_${timestamp}.html`;
const logPath = path.join(__dirname, jsonFilename);
const templatePath = path.join(__dirname, 'template.html');
const newHTMLPath = path.join(__dirname, HTMLFilename);

let logData = [];
if (fs.existsSync(logPath)) {
  try {
    logData = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  } catch (e) {
    logData = [];
  }
}

// If template exists, create HTML from it
if (fs.existsSync(templatePath)) {
  let templateContent = fs.readFileSync(templatePath, 'utf-8');
  let finalContent = templateContent.replace(/__JSON_FILENAME__/g, jsonFilename);
  fs.writeFileSync(newHTMLPath, finalContent);
  console.log(`✅ HTML page generated: ${HTMLFilename}`);
} else {
  console.warn("⚠️ template.html not found. Skipping HTML file generation.");
}

// Save new entry to JSON file
function saveToLog(entry) {
  logData.push({ ...entry });
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
}

// Connect to LIVE
connection.connect().then(state => {
  console.info(`✅ Connected to roomId ${state.roomId}`);
}).catch(err => {
  console.error('❌ Failed to connect', err);
});

// Chat messages
connection.on(WebcastEvent.CHAT, data => {
  saveToLog({
    username: data.user?.uniqueId || data.user?.nickname || 'unknown',
    comment: data.comment
  });
});

// Member joins
connection.on(WebcastEvent.MEMBER, data => {
  saveToLog({
    username: data.user?.uniqueId || 'unknown'
  });
});

// Gifts
connection.on(WebcastEvent.GIFT, data => {
  saveToLog({
    username: data.user?.uniqueId || 'unknown',
  });
});
