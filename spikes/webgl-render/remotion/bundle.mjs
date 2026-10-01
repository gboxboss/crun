import { bundle } from '@remotion/bundler';
import path from 'path';
import fs from 'fs';
const t = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('build') });
fs.writeFileSync('serveurl.txt', serveUrl);
console.log('bundled in', Date.now() - t, 'ms ->', serveUrl);
