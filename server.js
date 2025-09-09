#!/usr/bin/env node

// =================================================================
// FINAL VERCEL OVERRIDE - BYPASSING ALL CONFIG FILE LOGIC
// This script manually sets up the environment and starts the server,
// completely avoiding SillyTavern's problematic file-based config initialization.
// =================================================================

import path from 'node:path';
import { serverDirectory } from './src/server-directory.js';

console.log('Entering Vercel-specific server bootstrap...');
console.log(`Node version: ${process.version}. Running in ${process.env.NODE_ENV} environment.`);

// Manually set environment variables to prevent file writes
process.env.ST_LISTEN = 'true';
process.env.ST_BROWSERLAUNCH_ENABLED = 'false';
process.env.ST_LOGGING_ENABLEACCESSLOG = 'false';
process.env.ST_BACKUPS_CHAT_ENABLED = 'false';
process.env.ST_THUMBNAILS_ENABLED = 'false';
process.env.ST_PERFORMANCE_USEDISKCACHE = 'false';
process.env.ST_EXTENSIONS_MODELS_AUTODOWNLOAD = 'false';

// Manually set up global variables that CommandLineParser would have set.
// We provide the bare minimum for the server to start.
globalThis.DATA_ROOT = path.join(serverDirectory, 'data');
globalThis.COMMAND_LINE_ARGS = {
    // These values are now controlled by the environment variables above
    listen: true,
    browserLaunchEnabled: false,
    // Default values for other properties to prevent crashes
    port: parseInt(process.env.PORT || '8000', 10),
    dataRoot: globalThis.DATA_ROOT,
    config: './config.yaml', // This path is now irrelevant but might be checked for existence.
    configPath: './config.yaml', // Added to satisfy type
    enableIPv6: false,
    enableIPv4: true,
    dnsPreferIPv6: false,
    basicAuthMode: false,
    whitelistMode: false,
    enableCorsProxy: false,
    disableCsrf: false,
    requestProxyEnabled: false,
    requestProxyUrl: '',
    requestProxyBypass: [],
    // Added to satisfy type
    listenAddressIPv6: '[::]',
    listenAddressIPv4: '0.0.0.0',
    browserLaunchHostname: 'localhost',
    browserLaunchPort: -1,
    avoidLocalhost: false,
    browserLaunchAvoidLocalhost: false, // Added to satisfy type
    ssl: false,
    sslCert: '',
    sslKey: '',
    certPath: '', // Added to satisfy type
    keyPath: '', // Added to satisfy type
    // Methods
    getBrowserLaunchHostname: async () => 'localhost',
    getBrowserLaunchUrl: () => new URL(`http://localhost:${globalThis.COMMAND_LINE_ARGS.port}`),
    getIPv4ListenUrl: () => new URL(`http://0.0.0.0:${globalThis.COMMAND_LINE_ARGS.port}`),
    getIPv6ListenUrl: () => new URL(`http://[::]:${globalThis.COMMAND_LINE_ARGS.port}`),
};

console.log('Global variables and environment set for Vercel.');
console.log('Proceeding to start server-main.js...');

// Change to the server directory as the original script does
process.chdir(serverDirectory);

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('CRITICAL: Uncaught Exception:', error);
});

// Start the main application
try {
    await import('./src/server-main.js');
    console.log('server-main.js imported successfully.');
} catch (error) {
    console.error('A critical error has occurred while starting the server:', error);
    process.exit(1);
}
