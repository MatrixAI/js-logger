import path from 'node:path';
import url from 'node:url';
import b from 'benny';
import Logger, { LogLevel, formatting } from '@';
import { BenchHandler, suiteCommon } from './utils';

const filePath = url.fileURLToPath(import.meta.url);

async function main() {
  const msg = 'Hello World';
  const data = { foo: 'bar', bar: () => 'foo' };
  const summary = await b.suite(
    path.basename(filePath, path.extname(filePath)),
    b.add('formatting default', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler(formatting.formatter),
      ]);
      return () => {
        logger.info(msg, data);
      };
    }),
    b.add('formatting with keys path', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler(
          formatting.format`${formatting.level}:${formatting.keys}:${formatting.msg}`,
        ),
      ]);
      const loggerChild = logger.getChild('child');
      return () => {
        loggerChild.info(msg, data);
      };
    }),
    b.add('formatting with date', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler(
          formatting.format`${formatting.level}:${formatting.keys}:${formatting.msg}:${formatting.date}`,
        ),
      ]);
      return () => {
        logger.info(msg, data);
      };
    }),
    b.add('formatting with data', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler(
          formatting.format`${formatting.level}:${formatting.keys}:${formatting.msg}:${formatting.data}`,
        ),
      ]);
      return () => {
        logger.info(msg, data);
      };
    }),
    b.add('formatting with stacktrace', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler(
          formatting.format`${formatting.level}:${formatting.key}:${formatting.msg}${formatting.stack}`,
        ),
      ]);
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
