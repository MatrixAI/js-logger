import process from 'process';
import Logger, {
  LogLevel,
  ConsoleErrHandler,
  ConsoleOutHandler,
  StreamHandler,
  formatting,
} from '@';

describe('index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Testing basic usage of the logger with `console.error`', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root');
    logger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('DEBUG:root:DEBUG MESSAGE');
    logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:root:INFO MESSAGE');
    logger.warn('WARN MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('WARN:root:WARN MESSAGE');
    logger.error('ERROR MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('ERROR:root:ERROR MESSAGE');
    consoleSpy.mockRestore();
  });
  test('Testing basic usage of the logger with `console.log`', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockReturnValue();
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleOutHandler(),
    ]);
    logger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('DEBUG:root:DEBUG MESSAGE');
    logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:root:INFO MESSAGE');
    logger.warn('WARN MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('WARN:root:WARN MESSAGE');
    logger.error('ERROR MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('ERROR:root:ERROR MESSAGE');
    consoleSpy.mockRestore();
  });
  test('Testing standard stream usage', () => {
    const stderrSpy = jest.spyOn(process.stderr, 'write').mockReturnValue(true);
    const logger = new Logger('root', LogLevel.NOTSET, [new StreamHandler()]);
    logger.debug('DEBUG MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('DEBUG:root:DEBUG MESSAGE' + '\n');
    logger.info('INFO MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('INFO:root:INFO MESSAGE' + '\n');
    logger.warn('WARN MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('WARN:root:WARN MESSAGE' + '\n');
    logger.error('ERROR MESSAGE');
    expect(stderrSpy).toHaveBeenCalledWith('ERROR:root:ERROR MESSAGE' + '\n');
    stderrSpy.mockRestore();
  });
  test('Testing custom formatting', () => {
    jest
      .useFakeTimers('modern')
      .setSystemTime(new Date('2020-01-01').getTime());
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleErrHandler(
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
    consoleSpy.mockRestore();
  });
  test('Testing logger hierarchy', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
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
    consoleSpy.mockRestore();
  });
  test('Testing logger level hierarchy', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
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
    consoleSpy.mockRestore();
  });
  test('Testing logger hierarchy with keys format', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleErrHandler(
        formatting.format`${formatting.level}:${formatting.keys}:${formatting.msg}`,
      ),
    ]);
    const childLogger = logger.getChild('child');
    childLogger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('DEBUG:root.child:DEBUG MESSAGE');
    consoleSpy.mockRestore();
  });
  test('Testing logger trace', () => {
    jest
      .useFakeTimers('modern')
      .setSystemTime(new Date('2020-01-01').getTime());
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleErrHandler(
        formatting.format`${formatting.date}:${formatting.msg}${formatting.trace}`,
      ),
    ]);
    logger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^2020-01-01T00:00:00\.000Z:DEBUG MESSAGE\n(?:.+at.+\n)+.+at.+$/,
      ),
    );
    consoleSpy.mockRestore();
  });
  test('Testing overriding log format', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root', LogLevel.NOTSET);
    logger.debug('DEBUG MESSAGE', formatting.format`OVERRIDDEN`);
    expect(consoleSpy).toHaveBeenCalledWith('OVERRIDDEN');
    logger.info('INFO MESSAGE', formatting.format`OVERRIDDEN`);
    expect(consoleSpy).toHaveBeenCalledWith('OVERRIDDEN');
    logger.warn('WARN MESSAGE', formatting.format`OVERRIDDEN`);
    expect(consoleSpy).toHaveBeenCalledWith('OVERRIDDEN');
    logger.error('ERROR MESSAGE', formatting.format`OVERRIDDEN`);
    expect(consoleSpy).toHaveBeenCalledWith('OVERRIDDEN');
    consoleSpy.mockRestore();
  });
});
