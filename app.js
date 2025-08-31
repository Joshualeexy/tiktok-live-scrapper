import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 9000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

const loggers = {};
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start logger
app.post('/start', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Username required" });
  if (loggers[username]) return res.status(400).json({ message: `Logger for @${username} is already running.` });

  const script = path.join(__dirname, 'live.js');
  const proc = spawn('node', [script, username], { cwd: __dirname });

  proc.stdout.on('data', data => console.log(`[${username}] ${data}`));
  proc.stderr.on('data', data => console.error(`[${username} ERROR] ${data}`));
  proc.on('close', code => {
    console.log(`Logger for @${username} exited (code ${code})`);
    delete loggers[username];
  });

  loggers[username] = proc;
  res.json({ message: `✅ Logger started for @${username}`, pid: proc.pid });
});

// Stop logger
app.post('/stop', (req, res) => {
  const usernames = Object.keys(loggers);
  if (usernames.length === 0) return res.status(400).json({ message: "❌ No loggers running" });

  const username = req.body?.username || usernames[0]; // fallback to first one
  const proc = loggers[username];
  proc.kill('SIGINT');
  delete loggers[username];

  res.json({ message: `🛑 Stopped logger for @${username}`, pid: proc.pid });
});
// Stop all loggers
app.post('/stop-all', (req, res) => {
  const usernames = Object.keys(loggers);
  usernames.forEach(username => {
    loggers[username].kill('SIGINT');
    delete loggers[username];
  });
  res.json({ message: `🛑 Stopped all (${usernames.length}) loggers.` });
});

// Return status of all loggers
app.get('/status', (req, res) => {
  const status = Object.entries(loggers).map(([username, proc]) => ({
    username,
    pid: proc.pid
  }));
  res.json(status);
});

app.get('/loggers', (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading directory', error: err });
    }

    const htmlFiles = files.filter(file => file.endsWith('.html'));

    // Get file stats for each HTML file
    let pending = htmlFiles.length;
    const results = [];

    if (pending === 0) {
      return res.json({ files: [] });
    }

    htmlFiles.forEach(file => {
      const fullPath = path.join(__dirname, file);
      fs.stat(fullPath, (err, stats) => {
        if (!err) {
          results.push({ name: file, birthtime: stats.birthtime });
        }

        pending--;
        if (pending === 0) {
          // All stats fetched — sort by birthtime descending
          results.sort((a, b) => b.birthtime - a.birthtime);
          res.json({ files: results });
        }
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

