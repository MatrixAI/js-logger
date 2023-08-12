import type { LogRecord, LogFormatter } from './types.js';
import * as formatting from './formatting.js';

abstract class Handler {
  formatter: LogFormatter;

  public constructor(formatter: LogFormatter = formatting.formatter) {
    this.formatter = formatter;
  }

  public setFormatter(formatter: LogFormatter): void {
    this.formatter = formatter;
  }

  public handle(record: LogRecord, format?: LogFormatter): void {
    const output = format != null ? format(record) : this.format(record);
    this.emit(output);
  }

  public format(record: LogRecord): string {
    return this.formatter(record);
  }

  public abstract emit(output: string): void;
}

export default Handler;
