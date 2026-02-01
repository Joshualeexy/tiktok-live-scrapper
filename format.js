import fs from 'fs';
import path from 'path';

const keepFiles = new Set([
    'admin.html',
    'app.js',
    'index.html',
    'live.js',
    'package.json',
    'package-lock.json',
    'template.html',
    'format.js',
    'script.js'

]);

const dir = '.';

fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip directories
    if (stat.isDirectory()) return;

    const ext = path.extname(file);
    const base = path.basename(file);

    const isDeletable =
        (ext === '.json' || ext === '.jsonl' || ext === '.html') &&
        !keepFiles.has(base);

    if (isDeletable) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted ${file}`);
    }
}
);
console.log(`🗑️ cleanup complete`)
