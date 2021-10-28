import type Logger from './Logger';

enum LogLevel {
  NOTSET = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

function levelToString(level: LogLevel): string {
  switch (level) {
    case LogLevel.NOTSET:
      return 'NOTSET';
      break;
    case LogLevel.DEBUG:
      return 'DEBUG';
      break;
    case LogLevel.INFO:
      return 'INFO';
      break;
    case LogLevel.WARN:
      return 'WARN';
      break;
    case LogLevel.ERROR:
      return 'ERROR';
      break;
  }
}

interface ToString {
  toString: () => string;
}

type LogRecord = {
  key: string;
  date: Date;
  msg: string;
  level: LogLevel;
  logger: Logger;
};

type LogFormatter = (record: LogRecord) => string;

export { LogLevel, levelToString };

export type { ToString, LogRecord, LogFormatter };
