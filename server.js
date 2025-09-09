#!/usr/bin/env node
// ================= VERCEL CONFIG OVERRIDE =================
// We are bypassing the file-based config system entirely by setting environment variables.
// This is the most robust way to ensure the app starts in Vercel's read-only environment.
process.env.ST_LISTEN = 'true';
process.env.ST_BROWSERLAUNCH_ENABLED = 'false';
process.env.ST_LOGGING_ENABLEACCESSLOG = 'false';
process.env.ST_BACKUPS_CHAT_ENABLED = 'false';
process.env.ST_THUMBNAILS_ENABLED = 'false';
process.env.ST_PERFORMANCE_USEDISKCACHE = 'false';
process.env.ST_EXTENSIONS_MODELS_AUTODOWNLOAD = 'false';
// ========================================================

import { CommandLineParser } from './src/command-line.js';
import { serverDirectory } from './src/server-directory.js';

console.log(`Node version: ${process.version}. Running in ${process.env.NODE_ENV} environment. Server directory: ${serverDirectory}`);

// Vercel Runtime Logging Enhancement
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
});


// config.yaml will be set when parsing command line arguments
const cliArgs = new CommandLineParser().parse(process.argv);
globalThis.DATA_ROOT = cliArgs.dataRoot;
globalThis.COMMAND_LINE_ARGS = cliArgs;
process.chdir(serverDirectory);

try {
    await import('./src/server-main.js');
} catch (error) {
    console.error('A critical error has occurred while starting the server:', error);
}
