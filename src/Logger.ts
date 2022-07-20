import type { ToString, LogData, LogRecord, LogFormatter } from './types';
import type Handler from './Handler';
import { LogLevel } from './types';
import ConsoleErrHandler from './handlers/ConsoleErrHandler';
import * as utils from './utils';

class Logger {
  public key: string;
  public level: LogLevel;
  public filter?: RegExp;
  public readonly handlers: Set<Handler>;
  public readonly parent?: Logger;
  public readonly loggers: { [key: string]: Logger } = {};

  constructor(
    key: string = 'root',
    level: LogLevel = LogLevel.NOTSET,
    handlers: Array<Handler> = [new ConsoleErrHandler()],
    parent?: Logger,
  ) {
    this.key = key;
    this.level = level;
    this.handlers = new Set(handlers);
    this.parent = parent;
  }

  public getChild(key: string): Logger {
    if (this.loggers[key]) {
      return this.loggers[key];
    }
    const logger = new Logger(key, LogLevel.NOTSET, [], this);
    this.loggers[key] = logger;
    return logger;
  }

  public getParent(): Logger | undefined {
    return this.parent;
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public getEffectiveLevel(): LogLevel {
    if (this.level !== LogLevel.NOTSET) {
      return this.level;
    }
    if (this.parent) {
      return this.parent.getEffectiveLevel();
    }
    return this.level;
  }

  public isEnabledFor(level: LogLevel): boolean {
    return level >= this.level;
  }

  public addHandler(handler: Handler): void {
    this.handlers.add(handler);
  }

  public removeHandler(handler: Handler): void {
    this.handlers.delete(handler);
  }

  public clearHandlers(): void {
    this.handlers.clear();
  }

  public hasHandlers(): boolean {
    if (this.handlers.size) {
      return true;
    } else {
      return this.parent?.hasHandlers() ?? false;
    }
  }

  public setFilter(filter: RegExp): void {
    this.filter = filter;
  }

  public unsetFilter(): void {
    delete this.filter;
  }

  public debug(msg?: ToString, format?: LogFormatter): void;
  public debug(
    msg: ToString | undefined,
    data: LogData,
    format?: LogFormatter,
  ): void;
  public debug(
    msg?: ToString,
    formatOrData?: LogFormatter | LogData,
    format?: LogFormatter,
  ): void {
    if (formatOrData == null || typeof formatOrData === 'function') {
      return this.log(msg, {}, LogLevel.DEBUG, formatOrData as LogFormatter);
    } else {
      return this.log(msg, formatOrData, LogLevel.DEBUG, format);
    }
  }

  public info(msg?: ToString, format?: LogFormatter): void;
  public info(
    msg: ToString | undefined,
    data: LogData,
    format?: LogFormatter,
  ): void;
  public info(
    msg?: ToString,
    formatOrData?: LogFormatter | LogData,
    format?: LogFormatter,
  ): void {
    if (formatOrData == null || typeof formatOrData === 'function') {
      return this.log(msg, {}, LogLevel.INFO, formatOrData as LogFormatter);
    } else {
      return this.log(msg, formatOrData, LogLevel.INFO, format);
    }
  }

  public warn(msg?: ToString, format?: LogFormatter): void;
  public warn(
    msg: ToString | undefined,
    data: LogData,
    format?: LogFormatter,
  ): void;
  public warn(
    msg?: ToString,
    formatOrData?: LogFormatter | LogData,
    format?: LogFormatter,
  ): void {
    if (formatOrData == null || typeof formatOrData === 'function') {
      return this.log(msg, {}, LogLevel.WARN, formatOrData as LogFormatter);
    } else {
      return this.log(msg, formatOrData, LogLevel.WARN, format);
    }
  }

  public error(msg?: ToString, format?: LogFormatter): void;
  public error(
    msg: ToString | undefined,
    data: LogData,
    format?: LogFormatter,
  ): void;
  public error(
    msg?: ToString,
    formatOrData?: LogFormatter | LogData,
    format?: LogFormatter,
  ): void {
    if (formatOrData == null || typeof formatOrData === 'function') {
      return this.log(msg, {}, LogLevel.ERROR, formatOrData as LogFormatter);
    } else {
      return this.log(msg, formatOrData, LogLevel.ERROR, format);
    }
  }

  protected log(
    msg: ToString | undefined,
    data: LogData,
    level: LogLevel,
    format?: LogFormatter,
  ): void {
    // Filter on level before making a record
    if (level < this.getEffectiveLevel()) return;
    const record = this.makeRecord(msg, data, level);
    this.callHandlers(record, level, format);
  }

  /**
   * Constructs a `LogRecord`
   * The `LogRecord` can contain lazy values via wrapping with a lambda
   * This improves performance as they are not evaluated unless needed during formatting
   */
  protected makeRecord(
    msg: ToString | undefined,
    data: LogData,
    level: LogLevel,
  ): LogRecord {
    return {
      logger: this,
      key: this.key,
      date: new Date(),
      level,
      msg: msg?.toString(),
      data,
      keys: () => {
        let logger: Logger = this;
        let keys = this.key;
        while (logger.parent != null) {
          logger = logger.parent;
          keys = `${logger.key}.${keys}`;
        }
        return keys;
      },
      stack: () => {
        let stack: string;
        if (utils.hasCaptureStackTrace && utils.hasStackTraceLimit) {
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
        return stack;
      },
    };
  }

  protected callHandlers(
    record: LogRecord,
    level: LogLevel,
    format?: LogFormatter,
    keys: Array<string> = [],
  ): void {
    // Filter on level before calling handlers
    // This is also called when traversing up the parent
    if (level < this.getEffectiveLevel()) return;
    keys.push(this.key);
    if (this.filter != null) {
      const keysPath = keys.reduce((prev, curr) => `${curr}.${prev}`);
      if (!this.filter.test(keysPath)) return;
    }
    for (const handler of this.handlers) {
      handler.handle(record, format);
    }
    if (this.parent) {
      this.parent.callHandlers(record, level, format, keys);
    }
  }
}

export default Logger;
