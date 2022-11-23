import type Logger from './Logger';

enum LogLevel {
  NOTSET = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  SILENT = 100,
}

interface ToString {
  toString: () => string;
}

interface ToJSON {
  toJSON: (key?: string) => string;
}

type LogDataKey = string | number;

/**
 * Custom log data values
 * Values can be made lazy by wrapping it as a lambda
 */
type LogDataValue =
  | number
  | string
  | boolean
  | null
  | undefined
  | ToJSON
  | (() => LogDataValue)
  | Array<LogDataValue>
  | { [key: LogDataKey]: LogDataValue };

/**
 * Custom log data
 */
type LogData = Record<LogDataKey, LogDataValue>;

/**
 * Finalised log records
 */
type LogRecord = {
  logger: Logger;
  key: string;
  keys: string;
  level: LogLevel;
  msg: string | undefined;
  data: LogData;
  date: () => Date;
  stack: () => string;
};

type LogFormatter = (record: LogRecord) => string;

export { LogLevel };

export type {
  ToString,
  ToJSON,
  LogDataKey,
  LogDataValue,
  LogData,
  LogRecord,
  LogFormatter,
};
