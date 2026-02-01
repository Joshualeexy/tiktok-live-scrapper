# TikTok Stealth Live Logger

A robust Node.js utility designed for high-performance scraping of TikTok Live sessions. It spawns independent processes for each user, captures events in real-time to JSON, and generates interactive HTML viewers for every session.

## 🚀 Features
- **Multi-User Tracking**: Run multiple loggers simultaneously using Node.js child processes.
- **Real-time Logging**: Captures Chat, Member joins, and Gift events instantly.
- **Interactive Viewers**: Automatically generates a React-based HTML dashboard for every live session.
- **Admin Control Panel**: Centralized management to monitor active processes and browse historical logs.
- **Environment Configuration**: Easy setup via `.env` for ports and other settings.
- **Smart Cleanup**: Built-in utility to manage disk space by removing old log files.

## 📂 Project Structure
- `app.js` — Express management server and API gateway.
- `live.js` — The core scraping engine that connects to TikTok Webcast API.
- `index.html` — User interface for quick logger deployment.
- `admin.html` — Professional panel for process monitoring and log management.
- `template.html` — Professional React/Tailwind template used to render session logs.
- `format.js` — Maintenance helper to prune generated JSON/HTML files.

## 🛠️ Installation

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Copy the example environment file and adjust your settings:
   ```bash
   cp .env.example .env
   ```

## 🚥 Usage

### Start the Web Server
Launch the management dashboard:
```bash
npm start
```
By default, the server runs at `http://localhost:9000` (configurable via `.env`).

### Manual CLI Usage
Run a logger directly from the terminal without the web UI:
```bash
node live.js <tiktok_username>
```

## 🏗️ Technical Details

### Filename Convention
Logs are organized by date to ensure easy navigation:
- **JSON Data**: `username_live_YYYY_MM_DD.json`
- **HTML Viewer**: `username_live_YYYY_MM_DD.html`

### How it Works
1. When a session starts, `app.js` spawns a `node live.js` child process.
2. `live.js` uses the `tiktok-live-connector` to establish a persistent connection.
3. Every interaction is appended to a local JSON array.
4. An HTML file is cloned from `template.html`, which fetches its specific JSON data via React.

## 🛡️ Security & Privacy
- **Local Operation**: This tool is designed primarily for local or private server execution.
- **No Hardcoded Values**: All configuration is handled through `.env`.
- **Private API**: The endpoints are optimized for speed and private use; consider adding middleware if exposing to the public internet.

## 🧹 Maintenance
Regularly clean up your logs to save disk space:
```bash
node format.js
```
*Note: This will delete all generated .json and .html log files while keeping core engine files.*

## 📜 License
MIT - See the `LICENSE` file for details.
