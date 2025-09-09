import { kv } from '@vercel/kv';
import fs from 'node:fs';
import path from 'node:path';

const isVercel = process.env.VERCEL === '1';

// Helper to ensure paths are consistent
const normalizePath = (p) => p.replace(/\\/g, '/');

export const existsSync = (p) => {
    if (!isVercel) {
        return fs.existsSync(p);
    }
    // In Vercel KV, we can't truly check for a "directory".
    // We'll check if the file exists or if any key starts with this path (simulating a directory).
    // This is a simplified check. A real implementation might need more robust logic.
    // For now, we assume if we are checking a directory, we just say it exists to allow creation.
    // A better check would be to list keys, but that can be slow.
    return true; // Let's be optimistic for now.
};

export const mkdirSync = (p, options) => {
    if (!isVercel) {
        return fs.mkdirSync(p, options);
    }
    // Directories are implicit in Vercel KV (part of the key name). No-op.
};

export const readFileSync = async (p, encoding) => {
    if (!isVercel) {
        return fs.readFileSync(p, encoding);
    }
    const key = normalizePath(p);
    const content = await kv.get(key);
    if (content === null) {
        throw new Error(`ENOENT: no such file or directory, open '${p}'`);
    }
    return content;
};

export const writeFileSync = async (p, data) => {
    if (!isVercel) {
        return fs.writeFileSync(p, data);
    }
    const key = normalizePath(p);
    await kv.set(key, data);
};

export const readdirSync = async (p) => {
    if (!isVercel) {
        return fs.readdirSync(p);
    }
    const dir = normalizePath(p);
    // This is tricky. We need to list keys and simulate a directory listing.
    // Let's assume a simple structure for now. This will need refinement.
    const { keys } = await kv.scan(0, { match: `${dir}/*` });
    // We need to return just the file/folder names, not the full path
    return keys.map(key => path.basename(key));
};

export const statSync = (p) => {
    if (!isVercel) {
        return fs.statSync(p);
    }
    // Return a mock stat object. This is needed for some libraries.
    return {
        isFile: () => !p.endsWith('/'), // Simple guess
        isDirectory: () => p.endsWith('/'), // Simple guess
        size: 0, // Cannot determine size easily
    };
};

export const unlinkSync = async (p) => {
    if (!isVercel) {
        return fs.unlinkSync(p);
    }
    const key = normalizePath(p);
    await kv.del(key);
};

export const cpSync = async (source, destination, options) => {
    if (!isVercel) {
        return fs.cpSync(source, destination, options);
    }
    // Simplified cpSync for Vercel KV
    const data = await readFileSync(source);
    await writeFileSync(destination, data);
};

export const rmSync = async (p, options) => {
    if (!isVercel) {
        return fs.rmSync(p, options);
    }
    // Simplified rmSync. This would need to handle recursive deletion properly.
    const key = normalizePath(p);
    await kv.del(key);
};

// Export the original fs for anything we don't override
export default fs;