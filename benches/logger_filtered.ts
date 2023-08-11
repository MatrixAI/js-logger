import path from 'node:path';
import url from 'node:url';
import b from 'benny';
import Logger, { LogLevel, formatting } from '@';
import { BenchHandler, suiteCommon } from './utils/index.js';

const filePath = url.fileURLToPath(import.meta.url);

async function main() {
  const msg = 'Hello World';
  const data = { foo: 'bar', bar: () => 'foo' };
  const summary = await b.suite(
    path.basename(filePath, path.extname(filePath)),
    b.add('log level', () => {
      const logger = new Logger('root', LogLevel.WARN, [
        new BenchHandler(formatting.formatter),
      ]);
      return () => {
        logger.info(msg, data);
      };
    }),
    b.add('keys regex', () => {
      const logger = new Logger('root', LogLevel.WARN, [
        new BenchHandler(formatting.formatter),
      ]);
      logger.setFilter(/^notroot$/);
      return () => {
        logger.info(msg, data);
      };
    }),
    ...suiteCommon,
  );
  return summary;
}

if (import.meta.url.startsWith('file:')) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    void main();
  }
}

export default main;
