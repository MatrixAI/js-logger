import type { LogRecord, LogFormatter } from './types';

import { levelToString } from './types';

const level = Symbol('level');
const key = Symbol('key');
const keys = Symbol('keys');
const date = Symbol('date');
const msg = Symbol('msg');
const trace = Symbol('trace');

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
        const errorStack = new Error().stack;
        if (errorStack != null) {
          const splitErrorStack = errorStack.split('\n');
          const position =
            splitErrorStack.findIndex((value) => /Logger\.log/.test(value)) ??
            0;
          const formattedStack = splitErrorStack
            .splice(position + 2)
            .join('\n');
          result += '\n' + formattedStack;
        } else {
          result += '';
        }
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
