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
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
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
    jest.useRealTimers();
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
    logger.setLevel(LogLevel.DEBUG);
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
  test('Testing logger stacktrace', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleErrHandler(
        formatting.format`${formatting.date}:${formatting.msg}${formatting.stack}`,
      ),
    ]);
    logger.debug('DEBUG MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^2020-01-01T00:00:00\.000Z:DEBUG MESSAGE\n(?:.+at.+\n)+.+at.+$/,
      ),
    );
    consoleSpy.mockRestore();
    jest.useRealTimers();
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
  test('Test custom filters', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root');
    const interLogger = logger.getChild('inter');
    const leaf1Logger = interLogger.getChild('leaf1');
    const leaf2Logger = interLogger.getChild('leaf2');
    logger.setFilter(/^root\.inter/);
    leaf1Logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:leaf1:INFO MESSAGE');
    leaf2Logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:leaf2:INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    logger.setFilter(/^root\.inter\.leaf1/);
    leaf1Logger.info('INFO MESSAGE');
    leaf2Logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:leaf1:INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    logger.setFilter(/^root\.inter\.leaf2/);
    leaf1Logger.info('INFO MESSAGE');
    leaf2Logger.info('INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledWith('INFO:leaf2:INFO MESSAGE');
    expect(consoleSpy).toHaveBeenCalledTimes(4);
    consoleSpy.mockRestore();
  });
  test('Test JSON structured logging', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    const consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const logger = new Logger('root', LogLevel.NOTSET, [
      new ConsoleErrHandler(formatting.jsonFormatter),
    ]);
    const childLogger = logger.getChild('child');
    logger.debug('DEBUG MESSAGE', { a: 3 });
    logger.info('INFO MESSAGE', { 4: 4 });
    logger.warn('WARN MESSAGE', { c: 'abc' });
    logger.error('ERROR MESSAGE', { f: () => 'lol' });
    childLogger.info('INFO MESSAGE', {
      a: {
        b: () => ({
          c: {
            d: 4,
          },
        }),
      },
    });
    expect(consoleSpy.mock.calls[0]).toMatchSnapshot();
    expect(consoleSpy.mock.calls[1]).toMatchSnapshot();
    expect(consoleSpy.mock.calls[2]).toMatchSnapshot();
    expect(consoleSpy.mock.calls[3]).toMatchSnapshot();
    expect(consoleSpy.mock.calls[4]).toMatchSnapshot();
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });
  test('Test with undefined messages', () => {
    let consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const loggerHuman = new Logger('root');
    loggerHuman.info(undefined);
    expect(consoleSpy).toHaveBeenCalledWith('INFO:root:');
    loggerHuman.info(undefined, { a: '123' });
    expect(consoleSpy).toHaveBeenCalledWith('INFO:root:');
    loggerHuman.info();
    expect(consoleSpy).toHaveBeenCalledWith('INFO:root:');
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    consoleSpy.mockRestore();
    consoleSpy = jest.spyOn(console, 'error').mockReturnValue();
    const loggerJSON = new Logger('root', LogLevel.NOTSET, [
      new ConsoleErrHandler(formatting.jsonFormatter),
    ]);
    // The `msg` key is eliminated because it is `undefined` due to `JSON.stringify`
    loggerJSON.info(undefined);
    expect(JSON.parse(consoleSpy.mock.lastCall[0])).not.toHaveProperty('msg');
    loggerJSON.info(undefined, { a: '123' });
    expect(JSON.parse(consoleSpy.mock.lastCall[0])).not.toHaveProperty('msg');
    loggerJSON.info();
    expect(JSON.parse(consoleSpy.mock.lastCall[0])).not.toHaveProperty('msg');
    consoleSpy.mockRestore();
  });
});
