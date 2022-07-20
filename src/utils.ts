import type { LogData } from './types';
import { LogLevel } from './types';

const hasCaptureStackTrace = 'captureStackTrace' in Error;
const hasStackTraceLimit = 'stackTraceLimit' in Error;

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

function evalLogDataValue(this: any, _key: string, value: any): any {
  if (typeof value === 'function') {
    return value();
  } else {
    return value;
  }
}

function evalLogData(data: LogData) {
  return JSON.stringify(data, evalLogDataValue);
}

export {
  levelToString,
  evalLogDataValue,
  evalLogData,
  hasCaptureStackTrace,
  hasStackTraceLimit,
};
