import type { LogRecord } from '#types.js';
import path from 'node:path';
import url from 'node:url';
import b from 'benny';
import { BenchHandler, suiteCommon } from './utils/index.js';
import Logger, {
  LogLevel,
  formatting,
  levelToString,
  evalLogDataValue,
} from '#index.js';

const filePath = url.fileURLToPath(import.meta.url);

async function main() {
  const msg = 'Hello World';
  const data = { foo: 'bar', bar: () => 'foo' };
  const summary = await b.suite(
    path.basename(filePath, path.extname(filePath)),
    b.add('formatting default', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler(formatting.jsonFormatter),
      ]);
      return () => {
        logger.info(msg, data);
      };
    }),
    b.add('formatting with date', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler((record: LogRecord) => {
          return JSON.stringify(
            {
              level: levelToString(record.level),
              key: record.key,
              msg: record.msg,
              date: record.date(),
              ...record.data,
            },
            evalLogDataValue,
          );
        }),
      ]);
      return () => {
        logger.info(msg, data);
      };
    }),
    b.add('formatting with keys', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler((record: LogRecord) => {
          return JSON.stringify(
            {
              level: levelToString(record.level),
              key: record.key,
              msg: record.msg,
              keys: record.keys,
              ...record.data,
            },
            evalLogDataValue,
          );
        }),
      ]);
      const loggerChild = logger.getChild('child');
      return () => {
        loggerChild.info(msg, data);
      };
    }),
    b.add('formatting without lazy evaluation', () => {
      const logger = new Logger('root', LogLevel.NOTSET, [
        new BenchHandler((record: LogRecord) => {
          return JSON.stringify({
            level: levelToString(record.level),
            key: record.key,
            msg: record.msg,
            foo: record.data.foo,
            bar: (record.data.bar as () => string)(),
          });
        }),
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
