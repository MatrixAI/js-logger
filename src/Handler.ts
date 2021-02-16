import type { LogRecord, LogFormatter } from './types';

import * as formatting from './formatting';

abstract class Handler {
  formatter: LogFormatter;

  public constructor(formatter: LogFormatter = formatting.formatter) {
    this.formatter = formatter;
  }

  public setFormatter(formatter: LogFormatter): void {
    this.formatter = formatter;
  }

  public handle(record: LogRecord): void {
    const output = this.format(record);
    this.emit(output);
  }

  public format(record: LogRecord): string {
    return this.formatter(record);
  }

  public abstract emit(output: string): void;
}

export default Handler;
