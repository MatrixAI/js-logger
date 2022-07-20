import os from 'os';
import path from 'path';
import fs from 'fs';
import b from 'benny';
import Logger, { LogLevel, StreamHandler, ConsoleErrHandler } from '@';
import { suiteCommon } from './utils';

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
    path.basename(__filename, path.extname(__filename)),
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
  stderr.close();
  process.stderr.write = processStderrWrite;
  await fs.promises.rm(tmpDir, { recursive: true });
  return summary;
}

if (require.main === module) {
  void main();
}

export default main;
