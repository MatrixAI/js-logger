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
    b.add('1-levels', () => {
      const logger1 = new Logger('1', LogLevel.NOTSET, [
        new BenchHandler(formatting.formatter),
      ]);
      return () => {
        logger1.info(msg, data);
      };
    }),
    b.add('2-levels', () => {
      const logger1 = new Logger('1', LogLevel.NOTSET, [
        new BenchHandler(formatting.formatter),
      ]);
      const logger2 = logger1.getChild('2');
      return () => {
        logger2.info(msg, data);
      };
    }),
    b.add('3-levels', () => {
      const logger1 = new Logger('1', LogLevel.NOTSET, [
        new BenchHandler(formatting.formatter),
      ]);
      const logger2 = logger1.getChild('2');
      const logger3 = logger2.getChild('3');
      return () => {
        logger3.info(msg, data);
      };
    }),
    b.add('4-level logger', () => {
      const logger1 = new Logger('1', LogLevel.NOTSET, [
        new BenchHandler(formatting.formatter),
      ]);
      const logger2 = logger1.getChild('2');
      const logger3 = logger2.getChild('3');
      const logger4 = logger3.getChild('4');
      return () => {
        logger4.info(msg, data);
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
