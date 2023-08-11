import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';
import b from 'benny';
import Logger, { LogLevel, StreamHandler, ConsoleErrHandler } from '@';
import { suiteCommon } from './utils/index.js';

const filePath = url.fileURLToPath(import.meta.url);

async function main() {
  const msg = 'Hello World';
  const data = { foo: 'bar', bar: () => 'foo' };
  const processStderrWrite = process.stderr.write;
  // Temporary file performance here is the baseline for logging
  // it will be slower than logging to memory,
  // but faster than logging over the network
  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'logger_handlers-'),
  );
  const stderr = fs.createWriteStream(path.join(tmpDir, 'stderr'));
  process.stderr.write = stderr.write.bind(stderr);
  const summary = await b.suite(
    path.basename(filePath, path.extname(filePath)),
    b.add('console.error', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new ConsoleErrHandler(),
      ]);
      return () => {
        logger.info(msg, data);
      };
    }),
    b.add('process.stderr', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [new StreamHandler()]);
      return () => {
        logger.info(msg, data);
      };
    }),
    ...suiteCommon,
  );
  await new Promise<void>((resolve, reject) => {
    stderr.close((e) => (e != null ? reject(e) : resolve()));
  });
  process.stderr.write = processStderrWrite;
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
  return summary;
}

if (import.meta.url.startsWith('file:')) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    void main();
  }
}

export default main;
