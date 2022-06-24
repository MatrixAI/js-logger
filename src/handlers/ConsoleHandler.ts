import Handler from '../Handler';

class ConsoleHandler extends Handler {
  public emit(output: string): void {
    // eslint-disable-next-line no-console
    console.error(output);
  }
}

export default ConsoleHandler;
