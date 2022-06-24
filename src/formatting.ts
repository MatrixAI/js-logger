import type { LogRecord, LogFormatter } from './types';
import Logger from './Logger';

import { levelToString } from './types';

const level = Symbol('level');
const key = Symbol('key');
const keys = Symbol('keys');
const date = Symbol('date');
const msg = Symbol('msg');
const trace = Symbol('trace');

const hasCaptureStackTrace = 'captureStackTrace' in Error;
const hasStackTraceLimit = 'stackTraceLimit' in Error;

function format(
  strings: TemplateStringsArray,
  ...values: Array<any>
): LogFormatter {
  return (record: LogRecord): string => {
    let result = strings[0];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value === key) {
        result += record.key;
      } else if (value === keys) {
        let logger = record.logger;
        let keysPath = logger.key;
        while (logger.parent != null) {
          logger = logger.parent;
          keysPath = `${logger.key}.${keysPath}`;
        }
        result += keysPath;
      } else if (value === date) {
        result += record.date.toISOString();
      } else if (value === msg) {
        result += record.msg;
      } else if (value === level) {
        result += levelToString(record.level);
      } else if (value === trace) {
        let stack: string;
        if (hasCaptureStackTrace && hasStackTraceLimit) {
          Error.stackTraceLimit++;
          const error = {} as { stack: string };
          // @ts-ignore: protected `Logger.prototype.log`
          Error.captureStackTrace(error, Logger.prototype.log);
          Error.stackTraceLimit--;
          stack = error.stack;
          // Remove the stack title and the first stack line for `Logger.prototype.log`
          stack = stack.slice(stack.indexOf('\n', stack.indexOf('\n') + 1) + 1);
        } else {
          stack = new Error().stack ?? '';
          stack = stack.slice(stack.indexOf('\n') + 1);
        }
        if (stack !== '') result += '\n' + stack;
      } else {
        result += value.toString();
      }
      result += strings[i + 1];
    }
    return result;
  };
}

const formatter = format`${level}:${key}:${msg}`;

export { level, key, keys, date, msg, trace, format, formatter };
