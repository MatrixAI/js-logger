import type { LogRecord, LogFormatter } from './types.js';
import * as utils from './utils.js';

const level = Symbol('level');
const key = Symbol('key');
const keys = Symbol('keys');
const date = Symbol('date');
const msg = Symbol('msg');
const stack = Symbol('stack');
const data = Symbol('data');

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
        result += record.keys;
      } else if (value === date) {
        result += record.date().toISOString();
      } else if (value === msg) {
        if (record.msg != null) result += record.msg;
      } else if (value === level) {
        result += utils.levelToString(record.level);
      } else if (value === data) {
        result += utils.evalLogData(record.data);
      } else if (value === stack) {
        const stack = record.stack();
        if (stack !== '') result += '\n' + stack;
      } else {
        result += value.toString();
      }
      result += strings[i + 1];
    }
    return result;
  };
}

/**
 * Default formatter
 * This only shows the level, key and msg
 */
const formatter = format`${level}:${key}:${msg}`;

/**
 * Default JSON formatter for structured logging
 * You should replace this with a formatter based on your required schema
 * Note that `LogRecord` contains `LogData`, which may contain lazy values
 * You must use `utils.evalLogData` or `utils.evalLogDataValue` to evaluate
 * the `LogData`
 */
const jsonFormatter: LogFormatter = (record: LogRecord) => {
  return JSON.stringify(
    {
      level: utils.levelToString(record.level),
      key: record.key,
      msg: record.msg,
      ...record.data,
    },
    utils.evalLogDataValue,
  );
};

export {
  level,
  key,
  keys,
  date,
  msg,
  stack,
  data,
  format,
  formatter,
  jsonFormatter,
};
