// NusaStat entrypoint: hand in the built site, then serve it for the suite.
//
// Two jobs, in this order:
//   1. copy app/ and screenshots/ into the output directory and write
//      dossier.json with the kit's own buildDossier, so what we hand in and what
//      the scorer computes are byte for byte the same file;
//   2. when the suite gives us MAKEFUN_ENV_URL, bind a port of our own, register
//      it, answer /healthz, and wait for /done.
//
// Run outside the suite with no MAKEFUN_ENV_URL, it builds the dossier and
// exits, so `node main.ts` twice in a row is a deterministic check.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = import.meta.dirname;
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
for (const dir of ['app', 'screenshots']) {
  cpSync(join(root, dir), join(out, dir), { recursive: true });
}

// Only text_max_bytes shapes the bytes; the screenshot caps and the app caps
// only refuse. Passing the dossier's own ceilings keeps every capture we may
// hand in, and still matches the scorer's text budget.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 8, max_bytes: 4194304 },
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`dossier ${dossier.length} bytes at ${join(out, 'dossier.json')}`);

const env = process.env.MAKEFUN_ENV_URL;
if (!env) {
  console.log('no MAKEFUN_ENV_URL: built only, not serving');
  process.exit(0);
}

const base = env.replace(/\/+$/, '');

const server = createServer((request, response) => {
  if (request.url === '/healthz') {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('ok');
    return;
  }
  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found');
});

server.listen(0, '127.0.0.1', async () => {
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  console.log(`serving on ${port}`);

  try {
    await fetch(base + '/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ port }),
    });
  } catch (error) {
    console.error('register failed', (error as Error).message);
  }

  for (;;) {
    try {
      const answer = await fetch(base + '/done');
      if (answer.ok) {
        const body = await answer.text();
        if (body.trim() !== 'false') {
          console.log('done');
          server.close();
          process.exit(0);
        }
      }
    } catch {
      // The suite is between polls; try again rather than give up.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});
