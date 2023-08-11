import type { LogData } from './types.js';
import { LogLevel } from './types.js';

const hasCaptureStackTrace = 'captureStackTrace' in Error;
const hasStackTraceLimit = 'stackTraceLimit' in Error;

function levelToString(level: LogLevel): string {
  switch (level) {
    case LogLevel.NOTSET:
      return 'NOTSET';
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.ERROR:
      return 'ERROR';
    case LogLevel.SILENT:
      return 'SILENT';
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
