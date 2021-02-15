class Logger {
  public name: string;
  private parent: Logger;
  private loggers: Logger[];
  private handlers: Handler[];
  private level: number;

  constructor(name?: string, parent?, level?: number) {
    this.name = name ?? 'root';
    this.parent = parent ?? null;
    this.handlers = [];
    this.addHandler(new ConsoleHandler());
    this.level = level ?? 0;
    this.loggers = [];
  }

  public getLogger(name: string): Logger {
    if (this.loggers[name]) {
      return this.loggers[name];
    }
    let checkParent = this.parent;
    while (checkParent) {
      if (checkParent.loggers[name]) {
        return checkParent.loggers[name];
      }
      checkParent = this.parent;
    }
    this.loggers[name] = new Logger(name, this);
    return this.loggers[name];
  }

  public info(msg: string): void {
    this.log(msg, 2);
  }

  public warn(msg: string): void {
    this.log(msg, 3);
  }

  public debug(msg: string): void {
    this.log(msg, 1);
  }

  public error(msg: string): void {
    this.log(msg, 4);
  }

  public getLevelName(): string {
    let levelName = '';

    if (this.level === 1) {
      levelName = 'DEBUG';
    } else if (this.level === 2) {
      levelName = 'INFO';
    } else if (this.level === 3) {
      levelName = 'WARN';
    } else if (this.level === 4) {
      levelName = 'INFO';
    } else {
      levelName = 'NOTSET';
    }

    return levelName;
  }

  public setLevel(level: number): void {
    this.level = level;
  }

  public isEnabledFor(level: number): boolean {
    return level >= this.level;
  }

  public getName(): string {
    return this.name;
  }

  public getChild(suffix: string): Logger {
    if (!suffix) {
      throw new Error('Argument 1 of Logger.getChild is not specified.');
    }
    if (!this.loggers[suffix]) {
      throw new Error(`Logger has no child with name ${suffix}`);
    }
    return this.loggers[suffix];
  }

  public getParent(): Logger {
    return this.parent;
  }

  public addHandler(handler): void {
    if (typeof handler !== 'object') {
      throw new Error('Argument 1 of Logger.addHandler is not an object.');
    }
    this.handlers.push(handler);
  }

  public removeHandler(handler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  public hasHandlers(): boolean {
    if (this.handlers.length) {
      return true;
    }

    return false;
  }

  private makeRecord(msg: string, level: number): Record<string, any> {
    const date = new Date();
    const record = {
      created: `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()} @ ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      level: level,
      name: this.name,
      message: msg,
    };

    return record;
  }

  private log(msg, level: number): void {
    const record = this.makeRecord(msg, level);

    if (level >= this.level) {
      this.callHandlers(record);
    }
  }

  private callHandlers(record): void {
    if (this.hasHandlers()) {
      this.handlers.forEach((handler) => {
        handler.handle(record);
      });
    } else {
      this.parent.callHandlers(record);
    }
  }
}

abstract class Handler {
  public handle(record): void {
    this.emit(record);
  }

  protected abstract emit(record);
}

class ConsoleHandler extends Handler {
  constructor() {
    super();
  }

  protected emit(record): void {
    console.error(record.created, ': ', record.name, ': ', record.message);
  }
}

export default Logger;
