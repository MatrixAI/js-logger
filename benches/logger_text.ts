import path from 'path';
import fs from 'fs';
import b from 'benny';
import Logger, { LogLevel, formatting } from '@';
import BenchHandler from './utils/BenchHandler';
import packageJson from '../package.json';

async function main() {
  const msg = 'Hello World';
  const data = { foo: 'bar', bar: () => 'foo' };
  const summary = await b.suite(
    path.basename(__filename, path.extname(__filename)),
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
    b.cycle(),
    b.complete(),
    b.save({
      file: (summary) => summary.name,
      folder: path.join(__dirname, 'results'),
      version: packageJson.version,
      details: true,
    }),
    b.save({
      file: (summary) => summary.name,
      folder: path.join(__dirname, 'results'),
      version: packageJson.version,
      format: 'chart.html',
    }),
  );
  return summary;
}

if (require.main === module) {
  void main();
}

export default main;
