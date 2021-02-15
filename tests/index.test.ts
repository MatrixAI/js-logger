import Logger from '../src/Logger';

jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());

describe('index', () => {
  test('Testing the output of the logger', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const logger = new Logger();
    logger.info('Test output');
    expect(consoleSpy).toHaveBeenCalledWith(
      '1/1/2020 @ 11:0:0',
      ': ',
      'root',
      ': ',
      'Test output',
    );
  });
});
