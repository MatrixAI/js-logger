import process from 'process';
import Logger, { LogLevel, ConsoleHandler, StreamHandler, formatting } from '@';

describe('index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Testing basic usage of the logger', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const logger = new Logger('root');
    logger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('DEBUG:root:DEBUG MESSAGE');
    logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:root:INFO MESSAGE');
    logger.warn('WARN MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('WARN:root:WARN MESSAGE');
    logger.error('ERROR MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('ERROR:root:ERROR MESSAGE');
  });
  test('Testing standard stream usage', () => {
    const stderrSpy = jest.spyOn(process.stderr, 'write');
    const logger = new Logger('root', LogLevel.NOTSET, [new StreamHandler()]);
    logger.debug('DEBUG MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('DEBUG:root:DEBUG MESSAGE' + '\n');
    logger.info('INFO MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('INFO:root:INFO MESSAGE' + '\n');
    logger.warn('WARN MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('WARN:root:WARN MESSAGE' + '\n');
    logger.error('ERROR MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('ERROR:root:ERROR MESSAGE' + '\n');
  });
  test('Testing custom formatting', () => {
    jest
      .useFakeTimers('modern')
      .setSystemTime(new Date('2020-01-01').getTime());
    const consoleSpy = jest.spyOn(console, 'log');
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleHandler(
        formatting.format`${formatting.date}:${formatting.msg}`,
      ),
    ]);
    logger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith(
      '2020-01-01T00:00:00.000Z:DEBUG MESSAGE',
    );
    logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith(
      '2020-01-01T00:00:00.000Z:INFO MESSAGE',
    );
    logger.warn('WARN MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith(
      '2020-01-01T00:00:00.000Z:WARN MESSAGE',
    );
    logger.error('ERROR MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith(
      '2020-01-01T00:00:00.000Z:ERROR MESSAGE',
    );
  });
  test('Testing logger hierarchy', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const logger = new Logger('root');
    const childLogger = logger.getChild('child');
    childLogger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('DEBUG:child:DEBUG MESSAGE');
    childLogger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:child:INFO MESSAGE');
    childLogger.warn('WARN MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('WARN:child:WARN MESSAGE');
    childLogger.error('ERROR MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('ERROR:child:ERROR MESSAGE');
  });
  test('Testing logger level hierarchy', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const logger = new Logger('root', LogLevel.WARN);
    const childLogger = logger.getChild('child');
    childLogger.debug('DEBUG MESSAGE');
    expect(consoleSpy.mock.calls.length).toBe(0);
    childLogger.info('INFO MESSAGE');
    expect(consoleSpy.mock.calls.length).toBe(0);
    childLogger.warn('WARN MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('WARN:child:WARN MESSAGE');
    childLogger.error('ERROR MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('ERROR:child:ERROR MESSAGE');
    childLogger.setLevel(LogLevel.DEBUG);
    childLogger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('DEBUG:child:DEBUG MESSAGE');
    childLogger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:child:INFO MESSAGE');
  });
  test('Testing logger hierarchy with keys format', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleHandler(
        formatting.format`${formatting.level}:${formatting.keys}:${formatting.msg}`,
      ),
    ]);
    const childLogger = logger.getChild('child');
    childLogger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('DEBUG:root.child:DEBUG MESSAGE');
  });
});
