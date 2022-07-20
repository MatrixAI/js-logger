import path from 'path';
import b from 'benny';
import Logger, { LogLevel, formatting } from '@';
import { BenchHandler, suiteCommon } from './utils';

async function main() {
  const msg = 'Hello World';
  const data = { foo: 'bar', bar: () => 'foo' };
  const summary = await b.suite(
    path.basename(__filename, path.extname(__filename)),
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

if (require.main === module) {
  void main();
}

export default main;
