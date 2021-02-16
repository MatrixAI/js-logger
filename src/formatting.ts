import type { LogRecord, LogFormatter } from './types';

import { levelToString } from './types';

const key = Symbol('key');
const date = Symbol('date');
const msg = Symbol('msg');
const level = Symbol('level');

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
      } else if (value === date) {
        result += record.date.toISOString();
      } else if (value === msg) {
        result += record.msg;
      } else if (value === level) {
        result += levelToString(record.level);
      } else {
        result += value.toString();
      }
      result += strings[i + 1];
    }
    return result;
  };
}

const formatter = format`${level}:${key}:${msg}`;

export { key, date, msg, format, formatter };
