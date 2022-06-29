import type { ToString, LogRecord, LogFormatter } from './types';
import type Handler from './Handler';

import { LogLevel } from './types';
import ConsoleErrHandler from './handlers/ConsoleErrHandler';

class Logger {
  public key: string;
  public level: LogLevel;
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

  public debug(data: ToString, format?: LogFormatter): void {
    this.log(data.toString(), LogLevel.DEBUG, format);
  }

  public info(data: ToString, format?: LogFormatter): void {
    this.log(data.toString(), LogLevel.INFO, format);
  }

  public warn(data: ToString, format?: LogFormatter): void {
    this.log(data.toString(), LogLevel.WARN, format);
  }

  public error(data: ToString, format?: LogFormatter): void {
    this.log(data.toString(), LogLevel.ERROR, format);
  }

  protected log(msg: string, level: LogLevel, format?: LogFormatter): void {
    const record = this.makeRecord(msg, level);
    if (level >= this.getEffectiveLevel()) {
      this.callHandlers(record, format);
    }
  }

  protected makeRecord(msg: string, level: LogLevel): LogRecord {
    return {
      key: this.key,
      date: new Date(),
      msg: msg,
      level: level,
      logger: this,
    };
  }

  protected callHandlers(record: LogRecord, format?: LogFormatter): void {
    for (const handler of this.handlers) {
      handler.handle(record, format);
    }
    if (this.parent) {
      this.parent.callHandlers(record, format);
    }
  }
}

export default Logger;
