/**
 * Local static server for the corpus.
 *
 * Serves bench/corpus/ over HTTP so real screen readers (and the predict
 * stage, when it needs a URL) can navigate the case files. Binds explicitly
 * to 127.0.0.1 on an ephemeral port and asserts that binding, so the corpus
 * is never exposed on all interfaces.
 */

import { createServer, type Server } from 'http';
import { readFile } from 'fs/promises';
import { join, normalize, extname } from 'path';
import { CORPUS_DIR } from './manifest.js';

const HOST = '127.0.0.1';

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

export interface CorpusServer {
  /** Base URL, e.g. "http://127.0.0.1:54321". */
  url: string;
  /** Resolve a case file path (relative to corpus) to its full URL. */
  urlFor: (file: string) => string;
  close: () => Promise<void>;
}

/**
 * Start the corpus static server. Resolves once listening on 127.0.0.1.
 * Throws if the bound address is not 127.0.0.1 (defensive: never serve on 0.0.0.0).
 */
export function createCorpusServer(): Promise<CorpusServer> {
  const server: Server = createServer(async (req, res) => {
    try {
      const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
      // Prevent path traversal: normalize and reject anything escaping the corpus dir.
      const relative = normalize(rawPath).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^\/+/, '');
      const filePath = join(CORPUS_DIR, relative);
      if (!filePath.startsWith(CORPUS_DIR)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const body = await readFile(filePath);
      const type = CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type }).end(body);
    } catch {
      res.writeHead(404).end('Not Found');
    }
  });

  return new Promise<CorpusServer>((resolvePromise, reject) => {
    server.on('error', reject);
    // Ephemeral port, explicit loopback host.
    server.listen(0, HOST, () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string' || addr.address !== HOST) {
        server.close();
        reject(new Error(`Corpus server bound to unexpected address: ${JSON.stringify(addr)} (expected ${HOST}).`));
        return;
      }
      const url = `http://${HOST}:${addr.port}`;
      resolvePromise({
        url,
        urlFor: (file: string) => `${url}/${file.replace(/^\/+/, '')}`,
        close: () =>
          new Promise<void>((res, rej) => server.close((err) => (err ? rej(err) : res()))),
      });
    });
  });
}
