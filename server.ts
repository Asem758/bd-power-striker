import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const distServer = path.join(process.cwd(), 'dist', 'server.js');

async function main() {
  // If in production and the compiled bundle exists, run it directly
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distServer)) {
    await import(`file://${distServer}`);
    return;
  }

  // Check if TypeScript loader is active
  const hasTsx = process.execArgv.some((arg) => arg.includes('tsx')) || process.env.TSX_ACTIVE === 'true';

  if (hasTsx) {
    // Already running with tsx
    await import('./server/app.ts');
  } else {
    // Re-execute with tsx loader
    const child = spawn(process.execPath, ['--import=tsx', ...process.argv.slice(1)], {
      stdio: 'inherit',
      env: { ...process.env, TSX_ACTIVE: 'true' },
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code ?? 0);
      }
    });
  }
}

main().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
