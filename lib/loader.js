import { pathToFileURL } from 'url';
import { join, extname } from 'path';
import { readdir } from 'fs/promises';

/**
 * Asynchronously loads JavaScript files from specified directories.
 * 
 * This function scans through three main directories:
 * - plugins directory (from project root/plugins)
 * - SQL directory (from project root/sql)
 * - bot directory (from project root/bot)
 * 
 * For each directory, it reads all files and attempts to import any JavaScript files found.
 * Directories within these paths are ignored, except for the SQL directory.
 * 
 * @async
 * @function loadFiles
 * @returns {Promise<void>} A promise that resolves when all files have been processed
 * @throws {Error} Logs errors to console if file import fails
 */
export async function loadFiles() {
    const baseDir = process.cwd();
    const pluginsDir = join(baseDir, 'plugins');
    const sqlDir = join(baseDir, 'sql');
    const eventDir = join(baseDir, 'bot');

    const dirsToRead = [pluginsDir, sqlDir, eventDir];

    for (const dir of dirsToRead) {
        const files = await readdir(dir, { withFileTypes: true });
        await Promise.all(
            files.map(async file => {
                const fullPath = join(dir, file.name);
                if (file.isDirectory() && fullPath !== sqlDir) return;
                if (extname(file.name) === '.js') {
                    try {
                        // Convert the path to a proper file URL
                        const fileUrl = pathToFileURL(fullPath).href;
                        await import(fileUrl);
                    } catch (err) {
                        console.log('ERROR', `${file.name}: ${err.message}`);
                    }
                }
            }),
        );
    }
}
