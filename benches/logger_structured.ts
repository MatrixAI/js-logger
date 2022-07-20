import type { LogRecord } from '@/types';
import path from 'path';
import b from 'benny';
import Logger, {
  LogLevel,
  formatting,
  levelToString,
  evalLogDataValue,
} from '@';
import { BenchHandler, suiteCommon } from './utils';

async function main() {
  const msg = 'Hello World';
  const data = { foo: 'bar', bar: () => 'foo' };
  const summary = await b.suite(
    path.basename(__filename, path.extname(__filename)),
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

if (require.main === module) {
  void main();
}

export default main;
